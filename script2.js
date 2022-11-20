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
  clear() {
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

replay = function (isSame) {

  for(let i = 0; i < 7; i++) {
    main[i].clear();
  }

  for(let i = 0; i < 4; i++) {
    discard[i].clear();
  }

  stack[0].clear();
  stack[1].clear();

  if(!isSame) {
    deck = shuffleDeck(emptyDeck);
  }

  const deckCopy = [...deck];

  deckCopy.forEach(m => stack[1].el.push(m));

  for(let i = 0; i < 7; i++) {
    for(let j = i; j < 7; j++) {
      if (j == i)
        stack[1].el[0].vis = 1;
     main[j].el.push(stack[1].el[0]);
     stack[1].el.splice(0, 1);
   }
  }
  
  drawField();
}

replay(false);
//stack[1].el.forEach(m => m.vis = 1);

var shft = 25;
var hDim = 62;
var vDim = 73;
var vGap = 8
var hGap = 2;

cardId = function(cardNum, suit) {
  return cardNum.toString(16) + suit.toString(16);
}

cardCardId = function(card) {
  return cardId(card.no, card.suit);
}

cardEl = function(card) {
  return($("#" + cardCardId(card))[0]);
}

function elMove(el) {
  $(el).attr("ontouchstart", "dragstart_handler(event)").attr("ontouchend", "drop_handler(event)")
    .attr("ontouchmove","dragover_handler(event)").attr("draggable", "true").attr("ondragstart", "drag(event)");
}

function elFix(el) {
  $(el).attr("ontouchstart", "").attr("ontouchend", "").attr("ontouchmove","").attr("draggable", "false")
    .attr("ondragstart", "");
}

function dropTarget(el) {
  $(el).attr("ondrop","drop(event)").attr("ondragover","allowDrop(event)");
}

function nonDropTarget(el) {
  $(el).attr("ondrop","").attr("ondragover","");
}

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
    $(el).attr("class", "outerspan").attr("id", cardId(cardNum, suit));
    elMove(el);
    if(fixed) {
      elFix(el);
    }
    $(el).html(((red) ? '<mark class="red">' : '') + '<span class="innerspan">' + suitname + cardname + '</span>' + ((red) ? '</mark>' : ''));
    return el;
};

nonCardString = function(suit, top, left, suitNo) {
    let red = suit == "hearts" || suit == "diams" ? 1 : 0;
    let el = document.createElement("span");
    $(el).attr("class", "outerspan").attr("style", "top:" + top + "px; left:" + left + "px");
    if (suit === "") {
        $(el).attr("onclick", "procCmd('a')").attr("id", "stackoverturn").html('<span class="innerspan" />');
    } else {
        //$(el).html('<span class="innerspan place ' + ((red) ? 'red' : '') + '">&' + suit + ';</span>').attr("id", suitNo);
        dropTarget(el);
    }
    return el;
};

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("cardid", ev.target.id);
}

function move2cmd(from, to) {
  function isDown(a) {
    for(let i = 0; i < 7; i++) {
      if (main[i].el.map(m => cardCardId(m)).indexOf(a) !== -1) {
        return i;
      }
    }
    return -1;
  }
  function isUp(a) {
    for(let i = 0; i < 4; i++) {
      if (discard[i].el.map(m => cardCardId(m)).indexOf(a) !== -1) {
        return i;
      }
    }
    return ["0", "1", "2", "3"].indexOf(a);
  }
  if(isUp(to) !== -1) {
    procCmd('r ' + isDown(from));
  } else {
    if (isDown(from) === -1) {
      procCmd('d ' + isDown(to));
    } else {

    }
  }
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("cardid");
  if(ev.currentTarget.id === ev.target.closest(".outerspan").id) {
    move2cmd(data, ev.target.closest(".outerspan").id);
  }
}

let drawStack = function(arr) {
  let parentEl = null;
  for(let j = 0; j < arr.el.length; j++) {
    let currEl = cardEl(arr.el[j]);
    if(parentEl == null) {
      $("#main")[0].append(currEl);
    }
    else {
      parentEl.append(currEl);
    }
    parentEl = currEl;
  }
}

function laneToLeft(laneNo) {
    return (hGap + (hDim + hGap) * laneNo);
}

let moveDnStack = function(lane) {
  laneLen = main[lane].el.length;
  for(let i = 0; i < laneLen; i++) {
    let m = $(cardEl(main[lane].el[i]));
    m.css("top", vGap * 2 + vDim + shft*i + "px").css("left", laneToLeft(lane) + "px");
    main[lane].el[i].vis === 1 ? elMove(m) : elFix(m);
    if(main[lane].el[i].vis === 1) {
      m.css("height", vDim + shft * (laneLen - 1 - i) - 4 + "px");
    }
    dropTarget(m);
  }
}

let moveUpStack = function(lane) {
  if(lane === 6) {
    for(let i = 0; i < stack[1].el.length; i++) {
      let m = $(cardEl(stack[1].el[i]));
      m.css("top", vGap + "px").css("left", laneToLeft(lane) + "px");
      nonDropTarget(m);
    }
  } else {
    for(let i = 0; i < discard[lane].el.length; i++) {
      let m = $(cardEl(discard[lane].el[i]));
      m.css("top", vGap + "px").css("left", laneToLeft(lane) + "px").css("height", vDim -4 +"px");
      dropTarget(m);
    }
  }
}

let drawOpen = function() {
  const stockLen = stack[0].el.length
  for(let i = 0; i < stockLen; i++) {
    let m = $(cardEl(stack[0].el[i]));
    m.css("top", vGap + "px");
    elFix(m);
    nonDropTarget(m);
    switch (i) {
      case stockLen - 2:
        $(m).css("left", hGap + (hDim + hGap) * 5 -1*vGap*4 + 'px');
        break;
      case stockLen - 1:
        $(m).css("left", laneToLeft(5) + 'px');
        elMove(m);
        break;
      default:
        $(m).css("left", laneToLeft(5) -2*vGap*4 + 'px');
        break;
    }
  }
}

let drawField = function() {
  const deckCopy = [...deck];
  while (deckCopy.length > 0) {
    const card = deckCopy.pop();
    $("#main")[0].append(cardEl(card));
  }
  for(let i = 0; i < 7; i++) {
    drawStack(main[i]);
    moveDnStack(i);
  }
  for(let i = 0; i < 4; i++) {
    drawStack(discard[i]);
    moveUpStack(i);
  }
  for(let i = 0; i < 2; i++) {
    drawStack(stack[i]);
    i === 0 ? drawOpen() : moveUpStack(i+5);
  }
  $("#main")[0].append($("#stackoverturn")[0]);
}

getLast = function(inArr) {
  return inArr.el[inArr.el.length - 1];
}

lastMove = function(from, to) {
  to.el.push(getLast(from));
  from.el.splice(from.el.length-1);
  from.el[from.el.length - 1].vis = 1;
}

function suitColor(suit) {
    return [1, 2].includes(suit) ? "red" : "black";
}

function suitTest(suit1, suit2) {
    return suitColor(suit1) !== suitColor(suit2);
}

moveToMain = function(from, to, howmany) {
  if(from.el[from.el.length - howmany].vis = 1) {
    const neededFrom = [...from.el].slice(from.el.length - howmany);
    let doMove = false;
    if (to.el.length == 0 && neededFrom[0].no == 12) {
      doMove = true;
    } else {
      const bottom = getLast(to);
      if (bottom.no == neededFrom[0].no+1 && suitTest(neededFrom[0].suit, bottom.suit)) {
        doMove = true;
      }
    }
    if(doMove) {
      from.el.splice(from.el.length -howmany);
      from.el[from.el.length - 1].vis = 1;
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
      } else {
        for(let i = 0; i < 3; i++) {
          if (stack[1].el.length > 0) {
            stack[0].el.push(stack[1].el[0]);
            stack[1].el.splice(0,1);
          }
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
      const topile = parseInt(cmd.split(" ")[2]);
      let arr;
      if(cmdl > 0) {
        arr = main[cmdl];
      } else {
        arr = stack[0];
      }
      const lastEl = getLast(arr);
      const discardsuit = discard[topile];
      if(discardsuit.el.length == 0 ? lastEl.no == 0 : (lastEl.no == getLast(discardsuit).no + 1) && (lastEl.suit == grtLast(discardsuit).no) ) {
        lastMove(arr, discardsuit);
      }
      break;
    default:
      console.log("command " + cmd + " is not supported");
  }
  drawField();
}

window.addEventListener('load', function() {
    $("#main")[0].append(nonCardString("spades", vGap, hGap + (hGap + hDim) * 0, 0));
    $("#main")[0].append(nonCardString("hearts", vGap, hGap + (hGap + hDim) * 1, 1));
    $("#main")[0].append(nonCardString("diams", vGap, hGap + (hGap + hDim) * 2, 2));
    $("#main")[0].append(nonCardString("clubs", vGap, hGap + (hGap + hDim) * 3, 3));
    $("#main")[0].append(nonCardString("", vGap, hGap + (hGap + hDim) * 6));
    const deckCopy = [...deck];
    while (deckCopy.length > 0) {
        const card = deckCopy.pop();
        el = cardString(card.no, card.suit, false);
        $("#main")[0].append(el);
    }
    replay(false);
    //drawField();
    let btn = document.createElement("button");
    const btnTop = vGap * 3 + vDim * 2 + shft * 16;
    $(btn).css("top", btnTop + "px").html("start over").attr("onclick", "replay(true);");
    $("#main")[0].append(btn);
    btn = document.createElement("button");
    $(btn).css("top", btnTop + "px").css("left", "110px").html("new").attr("onclick", "replay(false);");
    $("#main")[0].append(btn);
    const onConfirmRefresh = function (event) {
        event.preventDefault();
        return event.returnValue = "Are you sure you want to leave the page?";
    }
    window.addEventListener("beforeunload", onConfirmRefresh, { capture: true });
});
