document.addEventListener('DOMContentLoaded', () => {

    // ========= VARIABLES GLOBALES =========
    let timerId;
    let matchTimeInSeconds = 180; // 3 minutes
    let isTimerRunning = false;
    let isMedicalBreak = false;
    let currentMatchScoreLeft = 0;
    let currentMatchScoreRight = 0;

    // Historique des actions pour l'annulation
    const scoreHistory = [];
    const MAX_HISTORY_SIZE = 30; 

    // Historique des sanctions pour suivre les groupes de fautes
const penalties = {
    // Joueur Gauche (Combattant 1)
    left: {
        group1: 0, // 0 = Pas de faute, 1 = Carton Blanc, 2 = Carton Jaune, 3+ = Carton Jaune (Règle : Blanc -> Jaune -> Jaune...)
        group2: 0, // 0 = Pas de faute, 1 = Carton Jaune, 2 = Carton Rouge, 3+ = Carton Rouge (Règle : Jaune -> Rouge -> Rouge...)
        group3: 0, // 0 = Pas de faute, 1 = Carton Rouge, 2+ = Carton Noir (Règle : Rouge -> Noir)
        group4: 0, // 0 = Pas de faute, 1 = Carton Noir
    },
    // Joueur Droit (Combattant 2)
    right: {
        group1: 0,
        group2: 0,
        group3: 0,
        group4: 0,
    }
};  

    // ========= SÉLECTION DES ÉLÉMENTS DU DOM =========
    const matchChronoDisplay = document.getElementById('matchChrono');
    const customTimeBtn = document.getElementById('customTimeBtn'); 
    const quickTimer30s = document.getElementById('quickTimer30s'); 
    const startStopButton = document.getElementById('startStopButton');
    const resetBtn = document.getElementById('resetBtn');
    const leftScoreDisplay = document.getElementById('left_score');
    const rightScoreDisplay = document.getElementById('right_score');
    const chronoControls = document.getElementById('chronoControls'); 

  
    // Autres boutons
    
    const medicalBreakBtn = document.getElementById('medicalBreakBtn');
    const chronoConfigBtn = document.getElementById('chronoConfigBtn');
    const whiteCardBtn = document.getElementById('whiteCardBtn');
    const yellowCardBtn = document.getElementById('yellowCardBtn');
    const redCardBtn = document.getElementById('redCardBtn');
    const blackCardBtn = document.getElementById('blackCardBtn');
    const undoBtn = document.getElementById('undoBtn');
    const faultButtons = document.querySelectorAll('.fault-btn');

    // Récupération de tous les boutons de points et de cartes
    const pointButtons = document.querySelectorAll('.point-btn');
    const cardButtons = document.querySelectorAll('.card-button');

    

    // ========= FONCTIONS DE BASE =========

    function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

     // Fonction pour régler le temps (ajustez si votre fonction s'appelle différemment)
    function setMatchTime(seconds) {
        clearInterval(timerId); // Arrête le chrono s'il était en cours
        isTimerRunning = false;
        
        matchTimeInSeconds = seconds;
        matchChronoDisplay.textContent = formatTime(matchTimeInSeconds);
        
        //  Mise à jour de l'état du bouton Start/Pause
        startStopButton.textContent = 'START';
        startStopButton.style.backgroundColor = 'green';
    }
    
    function saveStateToHistory() {
    if (scoreHistory.length >= MAX_HISTORY_SIZE) {
        scoreHistory.shift(); 
    }
    scoreHistory.push({
        left: currentMatchScoreLeft,
        right: currentMatchScoreRight,
        // NOUVEAU : On stocke une COPIE (Deep Clone) des pénalités
        penalties: JSON.parse(JSON.stringify(penalties))
    });
}
    

/**
 * Met à jour l'affichage visuel des compteurs de cartons.
 * Doit être appelée après chaque sanction, reset ou undo.
 */
function updateCardDisplay() {
    ['left', 'right'].forEach(player => {
        const p = penalties[player]; 

        // Initialisation des comptes affichés
        let countWhite = 0;
        let countYellow = 0;
        let countRed = 0;
        let countBlack = 0; // Seul le carton noir est cumulable dans l'affichage (si Groupe 3 ou Groupe 4)

        // =========================================================================
        // 1. DÉTERMINATION DE L'AFFICHAGE (LE BUG EST CORRIGÉ ICI)
        // La logique est: le carton le plus sévère prime.
        // =========================================================================

        // Groupe 1 (Faute Légère)
        // 1ère faute Grp 1: Carton Blanc
        if (p.group1 >= 1) {
            countWhite = 1;
        }
        // 2ème faute Grp 1 et suivantes: Carton Jaune
        if (p.group1 >= 2) {
            // Le blanc est effacé par le jaune dans cette progression
            countYellow += p.group1 - 1; 
        }

        // Groupe 2 (Faute Moyenne)
        // 1ère faute Grp 2: Carton Jaune (1er Jaune direct ou +1 aux jaunes cumulés)
        if (p.group2 >= 1) {
            // On ajoute la 1ère faute Grp 2 (qui est un Jaune)
            countYellow += 1; 
        }
        // 2ème faute Grp 2 et suivantes: Carton Rouge
        if (p.group2 >= 2) {
            // Le Jaune est effacé par le Rouge dans cette progression
            countRed += p.group2 - 1; 
        }
        
        // Groupe 3 (Faute Sévère)
        // 1ère faute Grp 3: Carton Rouge (1er Rouge direct ou +1 aux Rouges cumulés)
        if (p.group3 >= 1) {
            countRed += 1;
        }
        // 2ème faute Grp 3 (et match terminé): Carton Noir
        if (p.group3 >= 2) {
            // Le Rouge est effacé par le Noir (et le match est terminé)
            countBlack += 1;
        }

        // Groupe 4 (Faute d'Exclusion Directe)
        // 1ère faute Grp 4: Carton Noir
        if (p.group4 >= 1) {
            countBlack += 1; 
        }
        
        // =========================================================================
        // 2. MISE À JOUR DU DOM (Reste inchangé)
        // =========================================================================
        
        const cards = {
            white: countWhite,
            yellow: countYellow,
            red: countRed,
            black: countBlack,
        };

        for (const cardType in cards) {
            const displayElement = document.getElementById(`${player}_card_${cardType}`);
            if (displayElement) {
                const count = cards[cardType];
                displayElement.textContent = count;
                
                // Opacité : si le compte > 0, l'opacité est à 1 (visible), sinon à 0.2 (faible)
                // Seul le blanc est affiché si count=1, les autres affichent le nombre de cartons.
                const opacityValue = (count > 0 ? 1 : 0.2);
                displayElement.style.opacity = opacityValue;

                // Afficher le compte des cartons 
                if (count === 0) {
                    displayElement.textContent = '0';
                    } else {
                    displayElement.textContent = count;
                }
            }
        }
    });
} 
    function updateScore(player, points) {
        saveStateToHistory(); 

        if (player === 'left') {
            currentMatchScoreLeft += points;
            if (currentMatchScoreLeft < 0) currentMatchScoreLeft = 0;
            leftScoreDisplay.textContent = currentMatchScoreLeft;
        } else if (player === 'right') {
            currentMatchScoreRight += points;
            if (currentMatchScoreRight < 0) currentMatchScoreRight = 0;
            rightScoreDisplay.textContent = currentMatchScoreRight;
        }
    }
    
    function undoLastAction() {
    if (scoreHistory.length > 0) {
        // Supprime l'état actuel (qui est l'action que l'on souhaite annuler)
        scoreHistory.pop(); // On retire l'état post-action
        
        // Si l'historique est vide après le pop, on réinitialise à zéro
        if (scoreHistory.length === 0) {
            // Cas où on annule la toute première action. On réinitialise tout
            resetMatch(); 
            return;
        }

        // Récupère l'état précédent
        const previousState = scoreHistory[scoreHistory.length - 1]; 
        
        // Restaure les scores
        currentMatchScoreLeft = previousState.left;
        currentMatchScoreRight = previousState.right;
        leftScoreDisplay.textContent = currentMatchScoreLeft;
        rightScoreDisplay.textContent = currentMatchScoreRight;
        
        // Restaure les pénalités
        // On effectue un Deep Clone pour que les futurs changements ne modifient pas l'historique
        Object.assign(penalties.left, JSON.parse(JSON.stringify(previousState.penalties.left)));
        Object.assign(penalties.right, JSON.parse(JSON.stringify(previousState.penalties.right)));
        
        
    }
}
    
    function startStopTimer() {
        if (isTimerRunning) {
            clearInterval(timerId); 
            startStopButton.textContent = 'START';
            startStopButton.style.backgroundColor = 'green';
            isTimerRunning = false;
            resetBtn.style.display = 'block'; 
        } else {
            timerId = setInterval(updateTimer, 1000); 
            startStopButton.textContent = 'PAUSE';
            startStopButton.style.backgroundColor = 'red';
            isTimerRunning = true;
            resetBtn.style.display = 'none';
        }
    }

    function updateTimer() {
        if (matchTimeInSeconds > 0) {
            matchTimeInSeconds--;
            const minutes = Math.floor(matchTimeInSeconds / 60);
            const seconds = matchTimeInSeconds % 60;
            matchChronoDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            clearInterval(timerId);
            isTimerRunning = false;
            startStopButton.textContent = 'FIN DU MATCH';
            startStopButton.style.backgroundColor = 'gray';
        }
    }
    
    function resetMatch() {
        clearInterval(timerId);
        isTimerRunning = false;
        isMedicalBreak = false;
        currentMatchScoreLeft = 0;
        currentMatchScoreRight = 0;
        matchTimeInSeconds = 180;

        penalties.left = {
                group1: 0,
                group2: 0,
                group3: 0,
                group4: 0,
            };
                penalties.right = {
                group1: 0,
                group2: 0,
                group3: 0,
                group4: 0,

                
            };
        
        leftScoreDisplay.textContent = '0';
        rightScoreDisplay.textContent = '0';
        matchChronoDisplay.textContent = '03:00';
        startStopButton.textContent = 'START';
        startStopButton.style.backgroundColor = 'green';
        resetBtn.style.display = 'none';

        

    }



/**
 * Détermine le carton à donner et le nombre de points à attribuer.
 * Met à jour le compteur de fautes pour le groupe donné.
 * @param {string} player - 'left' ou 'right'
 * @param {number} group - Le groupe de faute (1, 2, 3, ou 4)
 * @returns {object} { card: string, points: number, endsMatch: boolean }
 */
function determineCardAndPoints(player, group) {
    let card = '';
    let points = 0;
    let endsMatch = false;
    let faultLevel = penalties[player]['group' + group];
    
    // La faute est appliquée au joueur ADVERSE
    const opponent = player === 'left' ? 'right' : 'left';

    // 1. Mise à jour du niveau de faute
    if (group !== 4) { // Le groupe 4 est toujours un Carton Noir, on n'incrémente pas son niveau
        penalties[player]['group' + group]++;
        faultLevel = penalties[player]['group' + group]; // Nouveau niveau après incrémentation
    }

    // 2. Détermination de la carte et des points
    switch (group) {
        case 1:
            // Règle : Carton Blanc (1ère faute), puis Carton Jaune (2ème faute et suivantes)
            if (faultLevel === 1) {
                card = 'white';
                points = 0; // Le Carton Blanc n'attribue pas de points
            } else {
                card = 'yellow';
                points = 3; 
            }
            break;

        case 2:
            // Règle : Carton Jaune (1ère faute), puis Carton Rouge (2ème faute et suivantes)
            if (faultLevel === 1) {
                card = 'yellow';
                points = 3;
            } else {
                card = 'red';
                points = 5;
            }
            break;

        case 3:
            // Règle : Carton Rouge (1ère faute), puis Carton Noir (2ème faute)
            if (faultLevel === 1) {
                card = 'red';
                points = 5;
            } else {
                card = 'black';
                //points = 0; // Pénalité maximale - AJOUTER POINTS SI NÉCESSAIRE
                endsMatch = true;
            }
            break;

        case 4:
            // Règle : Toujours un Carton Noir
            card = 'black';
            //points = 5; // Pénalité maximale - AJOUTER POINTS SI NÉCESSAIRE
            endsMatch = true;
            break;

        default:
            console.error("Groupe de faute invalide :", group);
            return { card: '', points: 0, endsMatch: false };
    }
    
    // Attribuer les points à l'adversaire (sauf pour le carton blanc)
    if (points > 0) {
        updateScore(opponent, points);
    }
    
    return { card: card, points: points, endsMatch: endsMatch };
}

/**
 * Gère la fin du match par élimination (Carton Noir).
 * Arrête le temps et affiche une alerte.
 * @param {string} player - Le joueur éliminé ('left' ou 'right').
 */
function handleElimination(player) {
    // 1. Arrêter le chronomètre
    if (isTimerRunning) {
        clearInterval(timerId); 
        isTimerRunning = false;
        startStopButton.textContent = 'MATCH TERMINÉ';
        startStopButton.style.backgroundColor = 'gray';
        resetBtn.style.display = 'block'; 
    }

    // 2. Déterminer l'adversaire (le gagnant)
    const winner = player === 'left' ? 'Combattant Vert' : 'Combattant Rouge';
    const eliminated = player === 'left' ? 'Combattant Rouge' : 'Combattant Vert';

    // 3. Afficher la popup (Utilisez une modale si vous en avez une, sinon alert)
    
    // --- OPTION SIMPLE (Alert) ---
    alert(`CARON NOIR ! Élimination de ${eliminated}.\nVictoire par élimination de ${winner}.`);
    // ----------------------------

    // --- OPTION COMPLEXE (Si vous avez une modale/overlay pour le Carton Noir, comme '#blackOverlay') ---
    /*
    const blackOverlay = document.getElementById('blackOverlay');
    if (blackOverlay) {
        // Personnalisez le message à l'intérieur de l'overlay avant de l'afficher
        blackOverlay.querySelector('h2').textContent = `ÉLIMINATION de ${eliminated} !`;
        blackOverlay.style.display = 'flex'; // ou 'block' selon votre CSS
        // Ajoutez un écouteur pour fermer la modale si nécessaire
    }
    */
}

    // ========= ÉCOUTEURS D'ÉVÉNEMENTS =========
    startStopButton.addEventListener('click', startStopTimer);
    resetBtn.addEventListener('click', resetMatch);
    undoBtn.addEventListener('click', undoLastAction); // Écouteur pour le bouton UNDO

    // Écouteurs pour les boutons de points (un seul bloc suffit)
    pointButtons.forEach(button => {
        button.addEventListener('click', () => {
            const player = button.dataset.player;
            const points = parseInt(button.dataset.points, 10);
            updateScore(player, points);
        });
    });


    //Afficher/Masquer les contrôles du chrono au clic sur l'affichage du chrono
    matchChronoDisplay.addEventListener('click', () => {
        // La méthode 'toggle' est la plus simple pour ajouter ou supprimer une classe
        chronoControls.classList.toggle('force-hide'); 
    });



    //Écouteur pour les  boutons de faute (Faute Grp 1, 2, 3, 4)
    faultButtons.forEach(button => {
        button.addEventListener('click', () => {
            const player = button.dataset.player; 
            const group = parseInt(button.dataset.group, 10); 
            
            // 1. Détermine la sanction, met à jour le score et l'historique de faute
            const sanction = determineCardAndPoints(player, group);

            // Update du compteur de carton
            updateCardDisplay(); 
            
            // 2. Gère la fin du match si carton noir
            if (sanction.endsMatch) {
                // APPEL DE LA NOUVELLE FONCTION D'ÉLIMINATION ICI
                handleElimination(player); 
            }
            
            // 3. Affichage console
            console.log(`Combattant ${player} a reçu un ${sanction.card.toUpperCase()} (Groupe ${group}). Points pour l'adversaire : ${sanction.points}`);
        });
    });


    // 1. Logique pour le bouton 30 SECONDES
    quickTimer30s.addEventListener('click', () => {
        setMatchTime(30); // 30 secondes
    });

    // 2. Logique pour le bouton TEMPS PERSONNALISÉ
    customTimeBtn.addEventListener('click', promptForCustomTime);

    function promptForCustomTime() {
        // 1. Demande du temps à l'utilisateur au format MM:SS
        const userInput = prompt("Entrez la nouvelle durée du match (au format MM:SS, ex: 05:00) :");

        if (!userInput) {
            // L'utilisateur a annulé
            return;
        }

        // 2. Validation et extraction (gestion du format MM:SS)
        const timeRegex = /^(\d{1,2}):(\d{2})$/;
        const match = userInput.match(timeRegex);

        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            
            if (seconds >= 60) {
                alert("Erreur: Les secondes doivent être inférieures à 60.");
                return;
            }

            // 3. Conversion en secondes et mise à jour
            const totalSeconds = (minutes * 60) + seconds;
            setMatchTime(totalSeconds);
        } else {
            alert("Format de temps invalide. Veuillez utiliser le format MM:SS (ex: 03:00).");
        }
    }

    // Bloc des raccourcis clavier
document.addEventListener('keydown', (event) => {
    // Empêche la barre d'espace de scroller ou d'avoir une action par défaut
    if (event.key === ' ') {
        event.preventDefault(); 
    }
    
    // Simplification de la touche pressée
    const key = event.key.toLowerCase();
    
    /// Bloc des raccourcis clavier
document.addEventListener('keydown', (event) => {
    
    // NOUVEAU : IGNORER LA RÉPÉTITION DES TOUCHES (FRONT MONTANT)
    if (event.repeat) {
        return; 
    }

    const key = event.key.toLowerCase();
    
    // Bloque les actions par défaut pour les touches utilisées pour le jeu
    const blockedKeys = [' ', 'q', 'w', 'e', 'a', 'z', 'b', 'j', 'r', 'n']; 
    if (blockedKeys.includes(key) || event.ctrlKey || event.altKey) {
        event.preventDefault(); 
    }
    
    const code = event.code; 
    
    // Joueur de gauche (Left): Pas de modificateur (Shift, Ctrl, Alt)
    const playerLeft = !event.shiftKey && !event.ctrlKey && !event.altKey;
    // Joueur de droite (Right): Modificateur Shift
    const playerRight = event.shiftKey && !event.ctrlKey && !event.altKey;


    // =======================================================
    // 1. GESTION DES POINTS (Basé sur la position des touches)
    // =======================================================
    if (playerLeft || playerRight) {
        let points = 0;
        let validKey = false;
        
        // Détermine la valeur du point
        switch (code) {
            case 'KeyA': // Touche 'A' (AZERTY) ou 'Q' (QWERTY)
            case 'KeyQ': 
                points = 1;
                validKey = true;
                break;
            
            case 'KeyZ': // Touche 'Z' (AZERTY) ou 'W' (QWERTY)
            case 'KeyW': 
                points = 3;
                validKey = true;
                break;

            case 'KeyE': // Touche 'E' (identique dans les deux cas)
                points = 5;
                validKey = true;
                break;
        }

        // Si la touche pressée est un raccourci de point
        if (validKey) {
            if (playerLeft) {
                updateScore('left', points);
            } else if (playerRight) {
                updateScore('right', points);
            }
        }
    }
    
    // ======================================================
    // 2. GESTION DES CARTONS (Basé sur la valeur de la touche : key)
    //    Left: B, J, R, N | Right: Alt+B, Alt+J, Alt+R, Alt+N
    //    Ici, 'key' (la valeur affichée sur la touche) est utilisé pour les sanctions.
    // ======================================================
    const applyPenalty = (player, group) => {
        const sanction = determineCardAndPoints(player, group);
        if (sanction.endsMatch) {
            handleElimination(player); 
        }
    };
    
    // Gère les fautes
    if (key === 'b' || key === 'j' || key === 'r' || key === 'n') {
        // Joueur Droit (Alt + Touche)
        if (event.altKey) {
            switch (key) {
                case 'b': applyPenalty('right', 1); break;
                case 'j': applyPenalty('right', 2); break;
                case 'r': applyPenalty('right', 3); break;
                case 'n': applyPenalty('right', 4); break;
            }
        } 
        // Joueur Gauche (Touche simple, sans Alt)
        else if (!event.ctrlKey) { 
            switch (key) {
                case 'b': applyPenalty('left', 1); break;
                case 'j': applyPenalty('left', 2); break;
                case 'r': applyPenalty('left', 3); break;
                case 'n': applyPenalty('left', 4); break;
            }
        }
    }

    // =======================================================
    // 3. COMMANDES GLOBALES
    // =======================================================
    switch (key) {
        case ' ':
            startStopTimer();
            break;
        
        // Réinitialisation (F5)
        case 'f5':
            // event.preventDefault() est appelé plus haut via le check global
            resetMatch();
            break; 
        
        // Annulation (Ctrl+Z)
        case 'z': 
            if (event.ctrlKey) {
                undoLastAction();
            }
            break;
    }
});
});

}); 