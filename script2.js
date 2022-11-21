class Card {
  constructor(suit,no,vis) {
    this.suit = suit;
    this.no = no;
    this.vis = vis;
  }
  static cardId(card) {
    return card.no.toString(16) + card.suit.toString(16);
  }
  static cardEl(card) {
    return($("#" + Card.cardId(card))[0]);
  }
  cardId() {
    return Card.cardId(this);
  }
  color() {
    return [1, 2].includes(this.suit) ? "red" : "black";
  }
}

class Stack {
  constructor () {
    this.el = [];
  }
  clear() {
    this.el = [];
  }
  len() {
    return this.el.length;
  }
  last() {
    if(this.len() === 0) {
      return null;
    } else {
      return  this.el[this.len() - 1];
    }
  }
  visLast() {
    if (this.len() > 0) {
      this.last().vis = true;
    }
  }
}

const shuffleDeck = function() {
  const initDeck = function(deck) {
    for(let suits = 0; suits < 4; suits++) {
      for(let nos = 0; nos < 13; nos++) {
        deck.push(new Card(suits, nos, false));
      }
    }
    return deck;
  }
  const deck = initDeck([]);
  const deck2 = [];
  while(deck.length > 0) {
    let idx = Math.floor(Math.random() * deck.length);
    deck2.push(deck[idx]);
    deck.splice(idx, 1);
  }
  return deck2;
}

let deck = [];

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
    deck = shuffleDeck();
  }

  const deckCopy = [...deck];

  deckCopy.forEach(m => stack[1].el.push(m));

  for(let i = 0; i < 7; i++) {
    for(let j = i; j < 7; j++) {
      if (j == i)
        stack[1].el[0].vis = true;
     main[j].el.push(stack[1].el[0]);
     stack[1].el.splice(0, 1);
   }
  }

  drawField();
}

//replay(false);
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
    let suitname = ["&spades;","&hearts;","&diams;","&clubs;"][suit];
    let cardname = ['A','2','3','4','5','6','7','8','9','10', 'J', 'Q', 'K'][cardNum];
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
        $(el).attr("id", suitNo);
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
      if (main[i].el.map(m => m.cardId).indexOf(a) !== -1) {
        return i;
      }
    }
    return -1;
  }
  function isUp(a) {
    for(let i = 0; i < 4; i++) {
      if (discard[i].el.map(m => m.cardId).indexOf(a) !== -1) {
        return i;
      }
    }
    return ["0", "1", "2", "3"].indexOf(a);
  }
  if(isUp(to) !== -1) {
    procCmd('r ' + isDown(from) + ' ' + isUp(to));
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
    main[lane].el[i].vis ? elMove(m) : elFix(m);
    if(main[lane].el[i].vis) {
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

lastMove = function(from, to) {
  to.el.push(from.last());
  from.el.splice(from.el.length-1);
}

moveToMain = function(from, to, howmany) {
  if(from.el[from.el.length - howmany].vis) {
    const neededFrom = [...from.el].slice(from.el.length - howmany);
    let doMove = false;
    if (to.el.length == 0 && neededFrom[0].no == 12) {
      doMove = true;
    } else {
      //const bottom = getLast(to);
      if (to.last().no == neededFrom[0].no+1 && (neededFrom[0].color() != to.last().color())) {
        doMove = true;
      }
    }
    if(doMove) {
      from.el.splice(from.el.length -howmany);
      //from.el[from.el.length - 1].vis = true;
      to.el=to.el.concat(neededFrom);
    }
  }
  return doMove;
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
    case "s": //from to how many  (sm) (m)
      const parm = (cmd.split(" ")).map(m => parseInt(m)).slice(1);
      const doMove = moveToMain(parm[0] < 0 ? stack[0]: main[parm[0]], main[parm[1]], parm[0] == 7 ? 1: parm[2]);
      if((parm[0] >= 0) && doMove) {
        main[parm[0]].visLast();
      }
      break;
    //case "d":
      //const cmdn = parseInt(cmd.split(" ")[1]);
      //moveToMain(stack[0], main[cmdn], 1);
      //break;
    case "r": //(sm) (d)
      const fromPileNo = parseInt(cmd.split(" ")[1]);
      const toPileNo = parseInt(cmd.split(" ")[2]);
      let fromPile;
      if(fromPileNo > 0) {
        fromPile = main[fromPileNo];
      } else {
        fromPile = stack[0];
      }
      const fromLast = fromPile.last(); //getLast(arr);
      const toLast = discard[toPileNo].last();
      if(discard[toPileNo].el.length === 0 ? fromLast.no === 0 : (fromLast.no === toLast.no + 1) && (fromLast.suit === toLast.suit) ) {
        lastMove(fromPile, discard[toPileNo]);
        if(fromPileNo > 0) {
          fromPile.visLast();
        }
      }
      break;
    case "u": //(d) (d)
      const from = parseInt(cmd.split(" ")[1]);
      const to = parseInt(cmd.split(" ")[2]);
      if((from !== to) && (discard[from].last().no === 0) && (discard[to].el.length === 0)) {
        lastMove(discard[from], discard[to]);
      }
      break;
    case "b": //(d) (m)
      const bparm1 = parseInt(cmd.split(" ")[1]);
      const bparm2 = parseInt(cmd.split(" ")[2]);
      moveToMain(discard[bparm1], main[bparm2], 1);
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
    //const deckCopy = [...deck];
    //while (deckCopy.length > 0) {
        //const card = deckCopy.pop();
    for(let suits = 0; suits < 4; suits++) {
      for(let nos = 0; nos < 13; nos++) {
        el = cardString(nos, suits, false);
        $("#main")[0].append(el);
      }
    }
    //}
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
