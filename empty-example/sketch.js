let generals = [];
let connections = [];
const numberOfGenerals = 8;

const fontSize = 20;

const MESSAGE_ATTACK = 'ATTACK';
const MESSAGE_NOT_ATTACK = 'NOT_ATTACK';

let phase = 1;
let round = 1;
let button;
let king_index = undefined;

const connectAllGenerals = () => {
    for (let i = 0; i < numberOfGenerals; i++) {
        for (let j = i + 1; j < numberOfGenerals; j++) {
            if (i != j && !generals[i].isConnected(generals[j])) {
                connections.push(new Connection(generals[i], generals[j]));
            }
        }
    }
}

function setup() {
    createCanvas(1000, 1000);
    textSize(fontSize)
    background(0);
    for (let i = 0; i < numberOfGenerals; i++) {
        generals[i] = new General(i + 1);
    }
    // Create liquid object
    connectAllGenerals();
}

function draw() {
    background(0);
    for (let i = 0; i < connections.length; i++) {
        connections[i].show();
    }

    for (let i = 0; i < generals.length; i++) {
        generals[i].show();
    }

    showTexts();
    fill(255, 102, 255);
    rect((width / 2) - 30, (height / 2) - 30, 60, 60, 10, 10, 10, 10);
    fill(0);
    textAlign(LEFT)
    text('CASTLE', (width / 2) - 30, (height / 2))
    fill(0);
    button = createButton(`Start round ${round}`);
    button.position(width / 2 - 45, 60);
    button.mousePressed(function () {
        if (round === 1) {
            if (!!king_index) {
                generals[king_index].isKing = false;
            }
            for (let i = 0; i < generals.length; i++) {
                generals[i].sendCurrentMessage();
            }
            round++;
        } else if (round === 2) {
            king_index = 2;
            generals[king_index].isKing = true;
            for (let i = 0; i < generals.length; i++) {
                if (i != king_index) {
                    if (generals[king_index].isTraitor) {
                        if (generals[i].isConnected(generals[king_index])) {
                            generals[i].receiveKingMessage(MESSAGE_NOT_ATTACK);
                        }
                    } else {
                        if (generals[i].isConnected(generals[king_index])) {
                            generals[i].receiveKingMessage(generals[king_index].currentMessageToSend);
                        }
                    }
                }
            }
            phase++;
            round = 1;
        }


    })

}


function showTexts() {
    textSize(15);
    textAlign(LEFT)
    fill(255)
    text(`Number of all generals: ${generals.length}`, 20, 30)
    text(`Number of traitors: ${generals.filter(i => i.isTraitor).length}`, 20, 50)
    text(`Number of required phases: ${generals.filter(i => i.isTraitor).length + 1}`, 20, 70)
    if (generals.filter(i => i.isTraitor).length >= Math.floor((generals.length / 4))) {
        text(`Too many traitors! Number of traitors must be lower than: ${Math.floor((generals.length / 4))}`, 20, 90)
    }

    textAlign(CENTER);
    text(`Phase: ${phase}`, width / 2, 30)

    fill(0)
}

function mouseClicked() {
    for (let i = 0; i < generals.length; i++) {
        generals[i].pressed();
    }
}

class General {

    constructor(name) {

        // const size = (width/2) * 0.

        const r = (width / 2) - 200;
        const message_r = (width / 2) - 100;
        const angle = (2 * PI / numberOfGenerals) * (name - 1);
        this.x = width / 2 + r * sin(angle);
        this.y = height / 2 + r * cos(angle);
        this.name = name.toString();
        this.isTraitor = false;
        this.currentMessageToSend = MESSAGE_ATTACK;
        this.message_x = width / 2 + message_r * sin(angle);
        this.message_y = height / 2 + message_r * cos(angle);
        this.receivedMessages = [];
        this.m_value = undefined;
        this.winningValue = undefined;
        this.isKing = false;
    }

    show() {

        if (this.isTraitor) {
            fill(255, 0, 0);
        } else {
            fill(102, 51, 0);
        }
        noStroke()
        ellipse(this.x, this.y, 40, 40)
        fill(0)
        textAlign(CENTER, CENTER)
        textSize(18);
        text(this.name, this.x, this.y)

        if (this.isKing) {
            fill(255, 211, 0);
            ellipse(this.x + 10, this.y - 10, 5, 5);
        }

        textSize(10);
        if (!!this.winningValue) {
            if (this.winningValue === MESSAGE_NOT_ATTACK) {
                fill(255, 0, 0);
                text(`Winning value: ${this.winningValue}`, this.message_x, this.message_y + 20);
            } else {
                fill(0, 153, 51)
                text(`Winning value: ${this.winningValue}`, this.message_x, this.message_y + 20);
            }
        }
        if (this.currentMessageToSend === MESSAGE_NOT_ATTACK) {
            fill(255, 0, 0);
            text(`Message to send: ${this.currentMessageToSend}`, this.message_x, this.message_y);
        } else {
            fill(0, 153, 51)
            text(`Message to send: ${this.currentMessageToSend}`, this.message_x, this.message_y);
        }
        fill(0);
    }

    isConnected(otherGeneral) {
        let connected = false;
        for (let i = 0; i < connections.length; i++) {
            if (connections[i].connectionName.includes(this.name + otherGeneral.name)) {
                connected = true;
            }
        }
        return connected;
    }

    pressed() {
        if (dist(this.x, this.y, mouseX, mouseY) < 20) {
            this.isTraitor = !this.isTraitor;
            this.currentMessageToSend = MESSAGE_ATTACK ? MESSAGE_NOT_ATTACK : MESSAGE_ATTACK;
        }
    }

    sendCurrentMessage() {
        for (let i = 0; i < numberOfGenerals; i++) {
            if (generals[i].name != this.name && this.isConnected(generals[i])) {
                generals[i].receiveMessage(this.currentMessageToSend);
            }
        }
    }

    receiveMessage(message) {
        this.receivedMessages.push(message);
        if (this.receivedMessages.length == generals.length - 1) {
            console.log(this.name, this.receivedMessages);
            const attackOccurrences = this.receivedMessages.filter(i => i === MESSAGE_ATTACK).length;
            const notAttackOccurrences = this.receivedMessages.filter(i => i === MESSAGE_NOT_ATTACK).length;
            if (attackOccurrences > notAttackOccurrences) {
                this.winningValue = MESSAGE_ATTACK;
                this.m_value = attackOccurrences;
            } else {
                this.winningValue = MESSAGE_NOT_ATTACK;
                this.m_value = notAttackOccurrences;
            }
            if (!this.isTraitor) {
                this.currentMessageToSend = this.winningValue;
            }
        }

    }

    receiveKingMessage(message) {
        if (this.m_value > Math.ceil((generals.length / 2)) + (generals.filter(i => i.isTraitor).length)) {
            this.currentMessageToSend = this.winningValue;
        } else {
            this.currentMessageToSend = message;
        }
        console.log(this.name, this.currentMessageToSend);
        this.receivedMessages = [];
    }


}

class Connection {

    constructor(generalA, generalB) {
        this.generalA = generalA;
        this.generalB = generalB;

        this.connectionName = [this.generalB.name + this.generalA.name, this.generalA.name + this.generalB.name];
    }

    show() {
        // const numberOfAllowedColors = 255 / (numberOfGenerals);
        // stroke(numberOfAllowedColors * this.generalA.name, numberOfAllowedColors * this.generalA.name, numberOfAllowedColors * this.generalA.name)
        stroke(255);
        strokeWeight(3);
        line(this.generalA.x, this.generalA.y, this.generalB.x, this.generalB.y)
    }

}

class Message {
    constructor(name, isKingMessage) {
        this.name = name;
        this.isKingMessage = isKingMessage;
    }
}




