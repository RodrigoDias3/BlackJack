var stack = 0;
var bet = 0;

var dealerHand = 0;
var yourHand = 0;

var hidden;
var hiddenImage;
var deck;

var countDealerAce = 0;
var countPlayerAce = 0;

var canHit = false; 
var canPlay = true;
var canClose = true;

var blackjack = false;
var dealerBlackJack = false;

var canStay = true;
var canDouble = true;

function closeAposta(){
    var aposta = document.querySelector('.aposta');

    if (aposta.style.display === 'block')
    {
        aposta.style.display = 'none';
    }
    else
    {
        aposta.style.display = 'block';
    }
}

async function startGame(){

    if (checkPlay())
    {
        var aposta = document.querySelector('.aposta');
        aposta.style.display = 'none';

        canPlay = false;

        buildDeck();
        shuffleDeck();

        for (i = 0; i < 2; i++) 
        {
            await sleep(500);
            var cardImg = document.createElement("img");
            var card = deck.pop();

            if (i == 0)
            {
                hidden = card;
                hiddenImage = cardImg;
                cardImg.src = "./cards/BACK.png";
            } 
            else 
            {
                cardImg.src = "./cards/" + card + ".png";
                /*check Ace to ask for insureance*/
            }
            
            dealerHand = dealerHand + getValueCard(card);
            countDealerAce = countDealerAce + checkAce(card);

            document.getElementById("dealerCards").append(cardImg);
        }

        if (dealerHand == 21)
        {
            dealerBlackJack = true;
        }

        for (i = 0; i < 2; i++) 
        {
            await sleep(500);
            var cardImg = document.createElement("img");
            var card = deck.pop();

            cardImg.src = "./cards/" + card + ".png";
            yourHand = yourHand + getValueCard(card);
            countPlayerAce = countPlayerAce + checkAce(card);

            document.getElementById("yourCards").append(cardImg);
        }

        setPlayerHandValue();
        checkCanHit();

        if(yourHand == 21){
            blackjack = true;
            stay();
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function stay(){
    canClose = false;

    if (!canPlay && canStay){
        canStay = false;

        hiddenImage.src = "./cards/" + hidden + ".png";

        setDealerHandValue();

        sleep(500);

        var temp = dealerHand;
        var aces = countDealerAce;

        while (aces > 0)
        {
            aces -= 1;
            if(temp > 16)
            {
                temp -= 10;
            }
        }

        while (temp < 17 || dealerHand < 17) 
        {
            await sleep(500);
            var cardImg = document.createElement("img");
            var card = deck.pop();

            cardImg.src = "./cards/" + card + ".png";
            
            document.getElementById("dealerCards").append(cardImg);

            dealerHand += getValueCard(card);
            temp += getValueCard(card);
            countDealerAce += checkAce(card);

            if (card[0] == 'A'){
                temp -= 10;
            }

            setDealerHandValue();
        }
        cashOut();
        await sleep(3000);

        openResults();
    }

    canClose = true;
}

function cashOut(){
    checkHands();

    if (blackjack && !dealerBlackJack){
        stack += 3*bet;
        setResultsMessage('BlackJack !!!',"Nice hand, you've won " + 3*bet + ' €');
        return;
    }

    if (yourHand > 21)
    {
        setResultsMessage('You Bust :(',"Ups, you've lost. Try again !");
        return;
    } 
    else if (dealerHand > 21)
    {
        stack += 2*bet;
        setResultsMessage('Dealer Bust :)',"Nice hand, you've won " + 2*bet + ' €');
        return;
    } 
    else if (yourHand > dealerHand)
    {
        stack += 2*bet;
        setResultsMessage("You've Won !","Nice hand, you've won " + 2*bet + ' €');
        return;
    }
    else if (yourHand == dealerHand)
    {
        stack += bet;
        setResultsMessage('Push :|',"Oh, nothing change. Here is your bet " + bet + ' €');
        return;
    }
    else
    {
        setResultsMessage("You've Lost !","Try again !");
        return;
    }

    bet = 0;
}

function checkHands(){
    while(countPlayerAce > 0)
    {
        countPlayerAce -= 1;
        if(yourHand > 21){
            yourHand -= 10;
        }
    }

    while(countDealerAce > 0)
    {
        countDealerAce -= 1;
        if(dealerHand > 21){
            dealerHand -= 10;
        }
    }
}

function double(){
    if (canHit && canDouble)
    {
        canDouble = false;

        setBet(bet);

        var cardImg = document.createElement("img");
        var card = deck.pop();

        cardImg.src = "./cards/" + card + ".png";
        yourHand = yourHand + getValueCard(card);
        countPlayerAce = countPlayerAce + checkAce(card);

        document.getElementById("yourCards").append(cardImg);
    }

    setPlayerHandValue();
    checkCanHit();
}

function hit(){
    if (canHit)
    {
        var cardImg = document.createElement("img");
        var card = deck.pop();

        cardImg.src = "./cards/" + card + ".png";
        yourHand = yourHand + getValueCard(card);
        countPlayerAce = countPlayerAce + checkAce(card);

        document.getElementById("yourCards").append(cardImg);
    }

    setPlayerHandValue();
    checkCanHit();
}

function checkCanHit(){
    if (!canPlay){
        if (yourHand > 21 && countPlayerAce > 0) 
        {
            var temp = yourHand - 10;
    
            if(temp > 21)
            {
                canHit = false;
            }
            else
            {
                canHit = true;
            }
        } 
        else if (yourHand > 21)
        {
            canHit = false; 
        } 
        else 
        {
            canHit = true;
        }
    }  
}

function checkPlay(){
    if(bet>0)
    {
        return canPlay;
    }
    else 
    {
        return false;
    }
}

function buildDeck(){

    var values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    var types = ["C", "D", "H", "S"];

    deck = [];

    for (i = 0; i < types.length; i++) 
    {
        for (j = 0; j < values.length; j++) 
        {
            deck.push(values[j] + "-" + types[i]);
        }
    }
}

function shuffleDeck(){
    for (i = 0; i < deck.length; i++) 
    {
        j = Math.floor(Math.random() * deck.length);

        var temp = deck[i];

        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function getValueCard(card) {
    var data = card.split("-");
    var value = data[0];

    if (isNaN(value)) 
    {
        if (value == "A") 
        {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    if (card[0] == "A") 
    {
        return 1;
    }
    return 0;
}

function setStack(){
    document.getElementById('stack').innerHTML = stack + ' €';
}

function setResultsMessage(msg1,msg2){
    document.getElementById('headerResult').innerHTML = msg1;
    document.getElementById('msg').innerHTML = msg2;
}

function setPlayerHandValue(){
    if (countPlayerAce == 0){
        document.getElementById('playerValue').innerHTML = '(' + yourHand + ')';
    }
    else
    {
        var temp = yourHand - 10;
        document.getElementById('playerValue').innerHTML = '(' + yourHand + ' or ' + temp + ')';
    }
}

function setDealerHandValue(){
    if (dealerHand == 0)
    {
        document.getElementById("dealerValue").innerHTML = '(???)';
    }
    else
    {
        if (countDealerAce == 0)
        {
            document.getElementById("dealerValue").innerHTML = '(' + dealerHand + ')';
        }
        else
        {
            var temp = dealerHand - 10;
            document.getElementById('dealerValue').innerHTML = '(' + dealerHand + ' or ' + temp + ')';
        }
    }
}

function setBet(num){
    if (num == 0)
    {
        stack = stack + bet;
        bet = 0;
    }
    else
    {
        bet = bet + num;
        stack = stack-num;
    }
    document.getElementById('bet').innerHTML = bet + ' €'
    setStack();
}

function buttonBet(num){
    if (stack-num >= 0 && canPlay)
    {
        setBet(num);
    }
}

function openAbout(){
    var about = document.querySelector('.About');

    if (about.style.display === 'block')
    {
        about.style.display = 'none';
    }
    else
    {
        about.style.display = 'block';
    }
}

function openResults(){
    var results = document.querySelector('.Results');

    if (results.style.display === 'block')
    {
        results.style.display = 'none';
        canPlay = true;
        cleanSys();
        closeAposta();
    }
    else
    {
        
        results.style.display = 'block';
    }
}

function openRules(){
    var rules = document.querySelector('.Rules');

    if (rules.style.display === 'block')
    {
        rules.style.display = 'none';
    }
    else
    {
        rules.style.display = 'block';
    }
}

function openGame(){
    stack = 1000;
    setStack();
    cleanSys();

    var game = document.querySelector('.Game');
    game.style.display = 'block';

    var aposta = document.querySelector('.aposta');
    aposta.style.display = 'block';
}

function closeWindows(){
    if (canClose)
    {
        var about = document.querySelector('.About');
        var rules = document.querySelector('.Rules');
        var game = document.querySelector('.Game');
        var results = document.querySelector('.Results');
    
        rules.style.display = 'none';
        about.style.display = 'none';
        game.style.display = 'none';
        results.style.display = 'none';
    
        cleanSys();
    } 
}

function cleanSys(){
    bet = 0;

    dealerHand = 0;
    yourHand = 0;
    countDealerAce = 0
    countPlayerAce = 0
    
    canHit = false; 
    canPlay = true;
    canStay = true;
    canDouble = true;

    document.getElementById('yourCards').innerHTML = '';
    document.getElementById('dealerCards').innerHTML = '';
    document.getElementById('headerResult').innerHTML = '';
    document.getElementById('msg').innerHTML = '';

    setBet(0);
    setPlayerHandValue();
    setDealerHandValue();
}
