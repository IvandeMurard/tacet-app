"""Unit tests for the acoustic engine (HOS-306).

Covers the pure-math core: haversine distance, compass bearing, the polar
heatmap builder, the O(1) shielding lookup, inverse-square attenuation and
the severity/yield matrix.

get_surrounding_buildings (osmnx/pandas) is never exercised: tests seed the
heatmap cache or pass building lists directly, so the heavy geo stack is
stubbed and CI stays lightweight.
"""
import math
import sys
from unittest.mock import MagicMock, patch

import pytest

for _mod in ("osmnx", "pandas"):
    if _mod not in sys.modules:
        sys.modules[_mod] = MagicMock()

from shapely.geometry import Polygon  # noqa: E402

from app.services.acoustic_engine import (  # noqa: E402
    ACOUSTIC_HEATMAP_CACHE,
    build_acoustic_heatmap,
    calculate_db_attenuation,
    determine_severity_and_action,
    get_bearing,
    get_shielding_penalty,
    haversine_distance,
)

HOTEL_LAT, HOTEL_LON = 48.8566, 2.3522  # Paris
# Degrees of longitude per meter at this latitude (~73 km per degree).
LON_PER_M = 1.0 / (111_320 * math.cos(math.radians(HOTEL_LAT)))


@pytest.fixture(autouse=True)
def _clear_cache():
    ACOUSTIC_HEATMAP_CACHE.clear()
    yield
    ACOUSTIC_HEATMAP_CACHE.clear()


def _square(center_lat: float, center_lon: float, half_lat: float, half_lon: float) -> Polygon:
    return Polygon([
        (center_lon - half_lon, center_lat - half_lat),
        (center_lon + half_lon, center_lat - half_lat),
        (center_lon + half_lon, center_lat + half_lat),
        (center_lon - half_lon, center_lat + half_lat),
    ])


class TestHaversine:
    def test_one_degree_of_latitude(self):
        # 1 degree of latitude is ~111.2 km everywhere on the globe.
        d = haversine_distance(48.0, 2.0, 49.0, 2.0)
        assert d == pytest.approx(111_195, abs=300)

    def test_zero_distance(self):
        assert haversine_distance(HOTEL_LAT, HOTEL_LON, HOTEL_LAT, HOTEL_LON) == 0.0

    def test_symmetry(self):
        a = haversine_distance(48.85, 2.35, 48.87, 2.30)
        b = haversine_distance(48.87, 2.30, 48.85, 2.35)
        assert a == pytest.approx(b)


class TestBearing:
    def test_due_north(self):
        assert get_bearing(48.0, 2.0, 49.0, 2.0) == 0

    def test_due_east(self):
        assert abs(get_bearing(48.0, 2.0, 48.0, 2.001) - 90) <= 1

    def test_due_south(self):
        assert get_bearing(49.0, 2.0, 48.0, 2.0) == 180

    def test_due_west(self):
        assert abs(get_bearing(48.0, 2.001, 48.0, 2.0) - 270) <= 1


class TestBuildAcousticHeatmap:
    def test_no_buildings_gives_max_range_everywhere(self):
        heatmap = build_acoustic_heatmap(HOTEL_LAT, HOTEL_LON, [])
        assert len(heatmap) == 360
        assert all(dist == 1500.0 for dist in heatmap.values())

    def test_building_east_shortens_east_rays_only(self):
        # ~40m x 110m facade centered ~200m due east of the hotel.
        building = {"polygon": _square(
            HOTEL_LAT, HOTEL_LON + 200 * LON_PER_M,
            half_lat=0.0005, half_lon=20 * LON_PER_M,
        )}
        heatmap = build_acoustic_heatmap(HOTEL_LAT, HOTEL_LON, [building])

        assert 150 < heatmap[90] < 250       # east ray stops at the facade
        assert heatmap[270] == 1500.0        # west ray unobstructed

    def test_buildings_within_20m_are_ignored(self):
        # The hotel's own footprint must not shield everything.
        own_footprint = {"polygon": _square(HOTEL_LAT, HOTEL_LON, 0.00008, 0.00012)}
        heatmap = build_acoustic_heatmap(HOTEL_LAT, HOTEL_LON, [own_footprint])
        assert all(dist == 1500.0 for dist in heatmap.values())


class TestShieldingPenalty:
    def _seed(self, hotel_id: str = "h1", obstacle_at: float = 200.0):
        heatmap = {angle: 1500.0 for angle in range(360)}
        for angle in range(85, 96):
            heatmap[angle] = obstacle_at
        ACOUSTIC_HEATMAP_CACHE[hotel_id] = heatmap

    def test_event_behind_obstacle_is_shielded(self):
        self._seed()
        event_lon = HOTEL_LON + 300 * LON_PER_M
        penalty = get_shielding_penalty("h1", HOTEL_LAT, HOTEL_LON, HOTEL_LAT, event_lon, 300.0)
        assert penalty == 15.0

    def test_event_in_front_of_obstacle_is_not_shielded(self):
        self._seed()
        event_lon = HOTEL_LON + 100 * LON_PER_M
        penalty = get_shielding_penalty("h1", HOTEL_LAT, HOTEL_LON, HOTEL_LAT, event_lon, 100.0)
        assert penalty == 0.0

    def test_cache_hit_skips_spatial_lookup(self):
        self._seed()
        with patch("app.services.acoustic_engine.get_surrounding_buildings") as spatial:
            get_shielding_penalty("h1", HOTEL_LAT, HOTEL_LON, HOTEL_LAT, HOTEL_LON + 0.004, 300.0)
        spatial.assert_not_called()


class TestDbAttenuation:
    def test_inverse_square_law_at_100m(self):
        # 20 * log10(100) = 40 dB of distance attenuation.
        assert calculate_db_attenuation(100.0, 0.0, 90.0) == pytest.approx(50.0)

    def test_shielding_penalty_applies(self):
        assert calculate_db_attenuation(100.0, 15.0, 90.0) == pytest.approx(35.0)

    def test_rain_adds_3db(self):
        assert calculate_db_attenuation(100.0, 0.0, 90.0, is_raining=True) == pytest.approx(53.0)

    def test_at_source_no_distance_attenuation(self):
        assert calculate_db_attenuation(0.5, 15.0, 90.0) == pytest.approx(75.0)

    def test_ambient_floor_35db(self):
        assert calculate_db_attenuation(1000.0, 0.0, 60.0) == 35.0


class TestSeverityMatrix:
    def test_critical_above_65(self):
        severity, action = determine_severity_and_action(70.0)
        assert severity == "CRITICAL"
        assert "-12.0%" in action  # (70 - 55) * 0.8

    def test_high_between_55_and_65(self):
        severity, action = determine_severity_and_action(60.0)
        assert severity == "HIGH"
        assert "-4.0%" in action

    def test_medium_between_45_and_55(self):
        severity, _ = determine_severity_and_action(50.0)
        assert severity == "MEDIUM"

    def test_low_below_45(self):
        severity, action = determine_severity_and_action(40.0)
        assert severity == "LOW"
        assert "0%" in action

    def test_yield_drop_capped_at_25_percent(self):
        _, action = determine_severity_and_action(120.0)
        assert "-25.0%" in action
