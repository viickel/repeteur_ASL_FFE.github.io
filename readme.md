# ⚔️ Repeteur d'escrime Sabre Laser 

## 📋 Description du Projet

Ce projet est un outil d'arbitrage simple et réactif, conçu pour la gestion du temps, des scores et des sanctions lors de matchs de sabre alaser.

L'interface est optimisée pour une utilisation tactile sur smartphone et est entièrement contrôlable au clavier pour les arbitres sur PC.

le projet est éditer avec la verssion 2025-2026 du reglement ASL-FFE

## ✨ Fonctionnalités Clés

* **Chronomètre:** Fonctionnalités START/PAUSE/RÉGLAGE (personnalisé ou 30s pour la morts subit, il faut cliquer sur le chrono pour afficher les fonction).
* **Scores:** Attribution de points rapides (+1, +3, +5).
* **Système de Sanctions:** Gestion des fautes avec progression de cartons et affichage visuel de l'état des pénalités pour chaque combattant.
* **Élimination (Carton Noir):** Déclenche une alerte de fin de match et d'élimination.
* **Interface Réactive:** Design optimisé pour les écrans de bureau et les smartphones.
* **Contrôle Total au Clavier:** Raccourcis optimisés pour les claviers AZERTY et QWERTY.

## 🚀 Installation & Utilisation

Ce projet est entièrement basé sur les technologies web (HTML, CSS, JavaScript) et ne nécessite aucune compilation.


## 🎮 Raccourcis Clavier (AZERTY/QWERTY)

Les raccourcis ont été configurés pour minimiser les conflits avec le navigateur et garantir un contrôle rapide, quelle que soit la configuration de votre clavier.

### 1. Contrôle du Temps et Général (Global)

| Action | Touche | Description |
| :--- | :--- | :--- |
| **Démarrer/Pause** | **Espace** (` `) | Met en pause ou redémarre le chronomètre. |
| **Annuler** | **Ctrl + Z** | Annule la dernière action de point ou de faute. |
| **Réinitialiser** | **F5** | Réinitialise l'intégralité du match. |

---

### 2. Attribution des Points (Points de Touche)

Le ciblage est basé sur la position des touches (`A/Q`, `Z/W`, `E/E`).

| Joueur | Point | Touches AZERTY | Touches QWERTY | Modificateur |
| :--- | :--- | :--- | :--- | :--- |
| **Gauche** | **+1** | **A** | **Q** | Touche seule |
| **Gauche** | **+3** | **Z** | **W** | Touche seule |
| **Gauche** | **+5** | **E** | **E** | Touche seule |
| **Droit** | **+1** | **Shift + A** | **Shift + Q** | **Shift** + Touche |
| **Droit** | **+3** | **Shift + Z** | **Shift + W** | **Shift** + Touche |
| **Droit** | **+5** | **Shift + E** | **Shift + E** | **Shift** + Touche |

---

### 3. Application des Sanctions (Cartons / Fautes)

Le modificateur **`Alt`** est utilisé pour cibler le joueur de droite.

| Joueur | Sanction | Touche | Modificateur | Action Déclenchée |
| :--- | :--- | :--- | :--- | :--- |
| **Gauche** | **Blanc** (Grp 1) | **B** | Touche seule | 1ère faute légère |
| **Gauche** | **Jaune** (Grp 2) | **J** | Touche seule | 1ère faute moyenne |
| **Gauche** | **Rouge** (Grp 3) | **R** | Touche seule | 1ère faute sévère |
| **Gauche** | **Noir** (Grp 4) | **N** | Touche seule | Exclusion directe |
| **Droit** | **Blanc** (Grp 1) | **B** | **Alt** | **Alt** + Touche |
| **Droit** | **Jaune** (Grp 2) | **J** | **Alt** | **Alt** + Touche |
| **Droit** | **Rouge** (Grp 3) | **R** | **Alt** | **Alt** + Touche |
| **Droit** | **Noir** (Grp 4) | **N** | **Alt** | **Alt** + Touche |

## 🤝 Contribution

Les contributions sont les bienvenues ! Si vous avez des suggestions de fonctionnalités, des corrections de bugs, ou des idées pour améliorer le design, n'hésitez pas à ouvrir une *issue* ou soumettre une *pull request*.

## 📄 Licence

Ce projet est distribué sous licence [LICENCE_A_CHOISIR, ex: MIT].