let player1Area = document.querySelector('.player1Cards');
let player2Area = document.querySelector('.player2Cards');

document.querySelector('.drawCards').addEventListener('click', obtainDeck);

document.querySelector('.hit').addEventListener('click', hit);
document.querySelector('.stay').addEventListener('click', stay);
document.querySelector('.refresh').addEventListener('click', refresh);

let deckId = ''
let hitAvailable = true;

let player2Sum = 0;
let player2AceCount = 0;
let player1Sum = 0;
let player1AceCount = 0;
let code;
let cardCode;

//obtain deck

function obtainDeck() {
    fetch(`https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            console.log(data);
            deckId = data.deck_id;
            drawFour();
            document.querySelector('.drawCards').disabled = true;
        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}


//draw 4 cards from deck
function drawFour() {
    const url = `https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`;
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            // assign 2 cards  to player and 2 to dealer
            let card1 = document.querySelector('#card1');
            card1.src = data.cards[0].image;
            let card2 = document.querySelector('#card2');
            card2.src = data.cards[1].image;
            //third card (dealer's first) is hidden
            let card3 = document.querySelector('#card3');
            card3.src = `https://www.deckofcardsapi.com/static/img/back.png`;
            let card3Source = data.cards[2].code;

            let card4 = document.querySelector('#card4');
            card4.src = data.cards[3].image;
            //add values of cards together
            let player1Value = convertNumber(data.cards[0].value) + convertNumber(data.cards[1].value);
            let player2Value = convertNumber(data.cards[2].value) + convertNumber(data.cards[3].value);

            player1Sum += player1Value;
            player1AceCount += aceCard(data.cards[0].value);
            player2Sum += player2Value;
            player2AceCount += aceCard(data.cards[2].value);

            dealerDraw();
            cardCode = card3Source;

        })
        .catch(err => {
            console.log(`error ${err}`)
        });

}

//assign values to royal cards
function convertNumber(val) {
    //if the card is A-J, return 10/11
    if (isNaN(val)) {
        if (val == 'ACE') {
            return 11;
        }
        else {
            return 10;
        }
    }
    //if not, return regular value of card
    return Number(val);
}

//to be used when close to 21
function aceCard(val) {
    if (val == 'ACE') {
        return 1;
    } else {
        return 0;
    }
}

//DEALER SECTION 

function dealerDraw() {
    const url = `https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            //makes the dealer draw until they hit >=17 score
            console.log(data);
            while (player2Sum < 17) {
                let newCardImage = document.createElement('img');
                let newCardValue = convertNumber(data.cards[0].value);
                newCardImage.src = data.cards[0].image;
                player2Area.appendChild(newCardImage);
                player2AceCount += aceCard(data.cards[0].value);
                player2Sum += newCardValue;
            }
        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}

//PLAYER SECTION

//let player hit (draw one card and add to player deck) until value >= 21
function hit() {
    const url = `https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            console.log(data);
            if (!hitAvailable) {
                return;
            } else {
                let newCardImage = document.createElement('img');
                let newCardValue = convertNumber(data.cards[0].value);
                newCardImage.src = data.cards[0].image;
                player1Area.appendChild(newCardImage);
                player1AceCount += aceCard(data.cards[0].value);
                player1Sum += newCardValue;
                //if ace is in hand, change value from 11 to 1, and revoke option to let player hit
                if (lowerAce(player1Sum, player1AceCount) > 21) {
                    hitAvailable = false;
                }
            }
        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}

//reduce Ace cards to 1 when applicable

function lowerAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return player1Sum;
}

//END GAME SECTION

//when stay is hit, reveal card and end game
function stay() {
    player1Sum = lowerAce(player1Sum, player1AceCount);
    // player2Sum = lowerAce(player2Sum, player2AceCount); 

    hitAvailable = false;
    card3.src = `https://deckofcardsapi.com/static/img/${cardCode}.png`;

    let results = '';
    if (player1Sum > 21) {
        console.log('Player 1 loses!');
    } else if (player2Sum > 21 && player1Sum <= 21) {
        console.log('Player 1 wins!');
    } else if (player1Sum == player2Sum) {
        console.log('Tie!');
    } else if (player1Sum > player2Sum) {
        console.log('Player 1 wins!');
    } else if (player1Sum < player2Sum) {
        console.log('Player 1 loses!');
    }
}

function refresh(){
    window.location.reload();
}