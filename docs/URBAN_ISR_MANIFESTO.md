# The Urban ISR Manifesto : Doctrine Architecturale de Tacet

*Date : Juin 2026*
*Objectif : Figer la philosophie architecturale issue de la "War Room" stratégique (Pelagon, Securaxis, Anduril Lattice OS, Hawkeye360).*

Tacet n'est pas un script météo. Tacet est un **Senseur Furtif (Urban ISR)** intégré au Mesh Hôtelier. Sa mission est de dissiper le brouillard de guerre urbain pour protéger le revenu (Yield) et l'expérience client. 

Pour accomplir cette mission sans s'effondrer sous le poids des données ou de la latence, tout agent ou développeur intervenant sur Tacet doit respecter les 5 piliers suivants :

---

## 1. Séparation des Responsabilités (Senseur vs Orchestrateur)
Le paradigme de l'écosystème repose sur une ligne de fracture stricte entre les mathématiques et le métier.
*   **Tacet (Le Senseur) :** Il applique de la physique spatiale pure. Il ne prend aucune décision financière. Il expose des mathématiques via une interface "Headless" (MCP).
*   **Aetherix (La Couche Sémantique) :** L'Orchestrateur ingère le calcul physique de Tacet et lui donne un sens humain et financier ("Intent-to-Task"). C'est Aetherix qui déclenche les tâches dans le PMS.

## 2. L'Agnosticisme des Données (Le Layer d'Abstraction)
Tacet doit pouvoir être déployé à Tokyo, Paris ou New York sans modifier son moteur de Ray-Tracing.
*   Toute source d'Open Data (Mairie, TomTom, Satellites) doit passer par un **Layer d'Abstraction** à l'ingestion.
*   Ce layer normalise le chaos en un objet universel abstrait : le `DisruptiveEvent`. Le moteur physique de Tacet ne consomme *que* cet objet standardisé.

## 3. Le Pattern of Life (La fin des seuils absolus)
Une donnée brute hors contexte n'a aucune valeur. 70 dB sur une grande avenue est normal ; 60 dB dans une cour intérieure est une crise.
*   Tacet ne doit jamais déclencher d'alertes basées sur des seuils absolus codés en dur.
*   La base de données locale de l'hôtel (**Idiosyncratic Memory**) sert de "Baseline". Tacet déclenche une alerte uniquement s'il détecte une **Anomalie** (une rupture de ce *Pattern of Life*).

## 4. L'Exigence du "Edge-First Processing" (Le Cache Spatial)
Télécharger des données topographiques (OSMnx) et calculer des intersections de lignes de vue en temps réel dans une requête web est strictement interdit.
*   Le Ray-Tracing 3D doit être asynchrone et pré-calculé (Génération d'une Heatmap Acoustique autour de l'hôtel).
*   En production (Run-time), l'API de Tacet doit se contenter d'interroger ce dictionnaire en cache (Temps de réponse exigé : < 100ms). Le filtrage se fait à la source (*Edge*).

## 5. Le Mesh Décentralisé (La Triangulation)
Pour les groupes hôteliers possédant plusieurs établissements dans une même zone :
*   Les hôtels partagent la "Détection pure" d'une anomalie sur le réseau Mesh (Compensation en cas de panne d'ingestion locale).
*   Ils peuvent s'utiliser mutuellement pour "Trianguler" la trajectoire d'une menace urbaine.
*   **Cependant :** L'évaluation des dégâts reste strictement locale. L'Hôtel A n'utilise jamais la configuration d'isolation phonique de l'Hôtel B pour calculer son propre risque. La *Sensory Memory* globale est abolie.

---
> *Toute feature (gadget IoT, calculs synchrones complexes, tableaux de bords visuels) qui viole l'un de ces piliers doit être identifiée et détruite.*
