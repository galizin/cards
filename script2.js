class Card {
  constructor(suit,no,vis) {
    this.suit = suit;
    this.no = no;
    this.vis = vis;
  }
}

class Stack {
  constructor () {
    this.el = [];
  }
}

const initDeck = function(deck) {
  for(let suits = 0; suits < 4; suits++) {
    for(let nos = 0; nos < 13; nos++) {
      deck.push(new Card(suits, nos, 0));
    }
  }
}

const shuffleDeck = function(deck) {
  const deck2 = [];
  while(deck.length > 0) {
    let idx = Math.floor(Math.random() * deck.length);
    deck2.push(deck[idx]);
    deck.splice(idx, 1);
  }
  return deck2;
}

const emptyDeck = [];

initDeck(emptyDeck);

const deck = shuffleDeck(emptyDeck);

const main=[];

for(let i = 0; i < 7; i++) {
  main.push(new Stack());
}

const discard=[];
for(let i = 0; i < 4; i++) {
  discard.push(new Stack());
}

const stack=[new Stack(), new Stack()];

deck.forEach(m => stack[1].el.push(m));

for(let i = 0; i < 7; i++) {
  for(let j = i; j < 7; j++) {
    if (j == i)
      stack[1].el[0].vis = 1;
    main[j].el.push(stack[1].el[0]);
    stack[1].el.splice(0, 1);
  }
}

stack[1].el.forEach(m => m.vis = 1);

var shft = 25;
var hDim = 62;
var vDim = 73;
var vGap = 8
var hGap = 2;

cardString = function(cardNum, suit, fixed) {
    let red = suit == 1 || suit == 2 ? 1 : 0;
    let suitname = "";
    switch (suit) {
        case 0:
            suitname = "&spades;";
            break;
        case 1:
            suitname = "&hearts;";
            break;
        case 2:
            suitname = "&diams;";
            break;
        case 3:
            suitname = "&clubs;";
            break;
    }
    let cardname = "";
    switch (cardNum) {
        case 0:
            cardname = "A";
            break;
        case 12:
            cardname = "K";
            break;
        case 11:
            cardname = "Q";
            break;
        case 10:
            cardname = "J";
            break;
        default:
            cardname = cardNum + 1 + "";
            break;
    }
    let el = document.createElement("span");
    $(el).attr("class", "outerspan").attr("id", suit.toString(16) + cardNum.toString(16))
    elMove(el);
    if(fixed) {
      elFix(el);
    }
    $(el).html(((red) ? '<mark class="red">' : '') + '<span class="innerspan">' + suitname + cardname + '</span>' + ((red) ? '</mark>' : ''));
    return el;
};

nonCardString = function(suit, top, left) {
    let red = suit == "hearts" || suit == "diams" ? 1 : 0;
    let el = document.createElement("span");
    $(el).attr("class", "outerspan").attr("style", "top:" + top + "px; left:" + left + "px");
    if (suit === "") {
        $(el).attr("onclick", "cycleStock()").attr("id", "stackoverturn");
        $(el).html('<span class="innerspan" />');
    } else {
        $(el).html('<span class="innerspan place ' + ((red) ? 'red' : '') + '">&' + suit + ';</span>');
    }
    return el;
};

let drawField = function() {

    const deckCopy = [...deck];
    while (deckCopy.length > 0) {
        const card = deckCopy.pop();
        el = cardString(card.no, card.suit, false);
        $("#main")[0].append(el);
    }

/*
  //let line = "";
  for(let i = 0; i<4; i++) {
    //line += discard[i].el.length == 0 ? "   " : discard[i].el[discard[i].el.length-1].toString() + " ";
  }
  for(let i = 0; i<3; i++) {
    //line += (stack[0].el.length - 3 + i) < 0 ? "   " : stack[0].el[stack[0].el.length - 3 + i].toString() + " ";
  }
  //line += "\n\n";

  let maxlen = 0;
  main.forEach(m => {if (maxlen < m.el.length) {maxlen = m.el.length}});

  for(let j = 0; j < maxlen; j++) {
    for(let i = 0; i < 7; i++) {
      if(j == main[i].el.length - 1 && main[i].el[j].vis == 0) {
        main[i].el[j].vis = 1;
      }
      line += j < main[i].el.length ? main[i].el[j].toString() + " " : "   ";
    }
    //line += "\n";
  }
  //$("pre").remove();
  //$("body").append("<pre>" + line + "</pre>");
  //$("input").val("");*/
}

//drawField();

getLast = function(inArr) {
  return inArr.el[inArr.el.length - 1];
}

lastMove = function(from, to) {
  to.el.push(getLast(from));
  from.el.splice(from.el.length-1);
}

moveToMain = function(from, to, howmany) {
  if(from.el[from.el.length - howmany].vis = 1) {
    const neededFrom = [...from.el].slice(from.el.length - howmany);
    let doMove = false;
    if (to.el.length == 0 && neededFrom[0].no == 12) {
      doMove = true;
    } else {
      const bottom = getLast(to);
      if (bottom.no == neededFrom[0].no+1 && neededFrom[0].suit %2 != bottom.suit %2) {
        doMove = true;
      }
    }
    if(doMove) {
      from.el.splice(from.el.length -howmany);
      to.el=to.el.concat(neededFrom);
    }
  }
}

procCmd = function(cmd) {
  switch(cmd.substring(0,1)) {
    case "a":
      if(stack[1].el.length === 0) {
        while(stack[0].el.length > 0) {
          stack[1].el.push(stack[0].el[0]);
          stack[0].el.splice(0,1);
        }
      }
      for(let i = 0; i < 3; i++) {
        if (stack[1].el.length > 0) {
          stack[0].el.push(stack[1].el[0]);
          stack[1].el.splice(0,1);
        }
      }
      break;
    case "s": //from to how many
      const parm = (cmd.split(" ")).map(m => parseInt(m)).slice(1);
      moveToMain(parm[0] == 7 ? stack[0]: main[parm[0]], main[parm[1]], parm[0] == 7 ? 1: parm[2]);
      break;
    case "d":
      const cmdn = parseInt(cmd.split(" ")[1]);
      moveToMain(stack[0], main[cmdn], 1);
      break;
    case "r":
      const cmdl = parseInt(cmd.split(" ")[1]);
      let arr;
      if(cmdl < 7) {
        arr = main[cmdl];
      } else {
        arr = stack[0];
      }
      const lastEl = getLast(arr);
      const discardsuit = discard[lastEl.suit];
      if(discardsuit.el.length == 0 ? lastEl.no == 0 : lastEl.no == getLast(discardsuit).no + 1) {
        lastMove(arr, discardsuit);
      }
      break;
    default:
      console.log("command " + cmd + " is not supported");
  }
  drawField();
}

window.addEventListener('load', function() {
    $("#main")[0].append(nonCardString("spades", vGap, hGap + (hGap + hDim) * 0));
    $("#main")[0].append(nonCardString("hearts", vGap, hGap + (hGap + hDim) * 1));
    $("#main")[0].append(nonCardString("diams", vGap, hGap + (hGap + hDim) * 2));
    $("#main")[0].append(nonCardString("clubs", vGap, hGap + (hGap + hDim) * 3));
    $("#main")[0].append(nonCardString("", vGap, hGap + (hGap + hDim) * 6));
    drawField();
    let btn = document.createElement("button");
    $(btn).css("top", "450px").html("start over").attr("onclick", "placeCards();");
    $("#main")[0].append(btn);
    btn = document.createElement("button");
    $(btn).css("top", "450px").css("left", "110px").html("new").attr("onclick", "shuffle(); placeCards();");
    $("#main")[0].append(btn);

    const onConfirmRefresh = function (event) {
        event.preventDefault();
        return event.returnValue = "Are you sure you want to leave the page?";
    }

    window.addEventListener("beforeunload", onConfirmRefresh, { capture: true });

});
