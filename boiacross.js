let limiteEsq, limiteDir, limiteTopo, limiteBaixo;
let vida = 3;
let score = 0;
let boia;
let obstaculos = [];
let estadoBoiacross = "start";

function setupBoiacross() {
  boia = new Boia(300, 300);
  
  limiteEsq = 0;
  limiteDir = 600;
  limiteTopo = 130;
  limiteBaixo = 400;
}

function drawBoiacross() {
  push()
  background(240);
  rectMode(CORNER);

  if (estadoBoiacross === "start") {
    telaStartBoiacross();
  } 
  else if (estadoBoiacross === "jogo") {
    rodarJogoBoiacross();
  } 
  else if (estadoBoiacross === "gameover") {
    telaGameOverBoiacross();
  }
}

function mousePressedBoiacross() {
  if (estadoBoiacross === "start") {
    if (mouseX > width/2 - 75 && mouseX < width/2 + 75 &&
        mouseY > height/2 && mouseY < height/2 + 50) {
      vida = 3;
      boia.resetar();
      obstaculos = [];
      estadoBoiacross = "jogo";
    }
  }
  else if (estadoBoiacross === "gameover") {
    if (mouseX > width/2 - 75 && mouseX < width/2 + 75 &&
        mouseY > height/2 && mouseY < height/2 + 50) {
      vida = 3;
      score = 0;
      boia.resetar();
      obstaculos = [];
      estadoBoiacross = "start";
    }
  }
}

// TELA START
function telaStartBoiacross() {
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0);
  text("Club Não Penguin", width/2, height/2 - 60);
  fill(255,0,0);
  text("Boia Cross", width/2, height/2 - 10);

  fill(0, 200, 100);
  rect(width/2 - 75, height/2 + 20, 150, 50, 10);

  fill(255);
  textSize(20);
  text("START", width/2, height/2 + 45);
}

// JOGO
function rodarJogoBoiacross() {
  background(240,240,240);
  
  fill(0, 255, 0, 0);
  rect(0, 130, width, height - 130);
  
  fill(0,120,255);
  ellipse(300, 305, 1000, 480);

  textAlign(LEFT, CENTER);
  textSize(24);
  fill(0);
  text("Vidas: " + vida, 60, 30);
  
  textAlign(RIGHT, CENTER);
  textSize(24);
  fill(0);
  text("Score: " + score, width - 60, 30);

  if (frameCount % 35 === 0) {
    let x = random(50, width - 50);
    obstaculos.push(new Obstaculo(x, 70));
  }

  for (let i = obstaculos.length - 1; i >= 0; i--) {
    let obs = obstaculos[i];

    obs.mover();
    obs.mostrar();

    let d = dist(boia.x, boia.y, obs.x, obs.y);
    if (d < boia.tamanho/2 + obs.tamanho/2) {
      vida -= 1;
      boia.resetar();
      obstaculos.splice(i, 1);
      
      if (vida <= 0) {
        estadoBoiacross = "gameover";
        Pinguim.moedas += score;
        exibirMensagemHUD("Você ganhou " + score + " moedas!");
      }
      
      continue;
    }

    if (obs.y > height) {
      obstaculos.splice(i, 1);
      score += 3;
    }
  }
  
  push();
  stroke(0);
  strokeWeight(4);
  let lanchaX = 300;
  let lanchaY = 100 + 35 * 1.3;
  line(lanchaX, lanchaY, boia.x, boia.y);
  pop();
  
  barco(300, 100);
  boia.mover();
  boia.mostrar();
}

// GAME OVER
function telaGameOverBoiacross() {
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(255, 0, 0);
  text("GAME OVER", width/2, height/2 - 70);
  fill(0);
  text("Score Total: " + score, width/2, height/2 - 30);

  fill(0, 200, 100);
  rect(width/2 - 75, height/2, 150, 50, 10);

  fill(255);
  textSize(20);
  text("RESTART", width/2, height/2 + 25);
}

function barco(x,y){
  push();
  stroke(0);
  strokeWeight(1);
  translate(x, y);
  scale(1.3);

  fill(255);
  ellipse(0, 0, 50, 80);

  fill(255);
  triangle(-25, -10, 25, -10, 0, -50);

  fill(230);
  ellipse(0, 5, 30, 50);

  fill(200);
  rectMode(CENTER);
  rect(0, -5, 15, 20, 5);

  fill(100,150,255);
  rect(0, -10, 10, 10, 3);

  fill(150);
  rect(0, 35, 15, 10, 3);
  
  noStroke();
  pop();
}

class Boia {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.inicialX = x;
    this.inicialY = y;

    this.tamanho = 50;
  }

  resetar() {
    this.x = this.inicialX;
    this.y = this.inicialY;
  }

  mostrar() {
    push();
    translate(this.x, this.y);
    scale(1.5);
    rectMode(CENTER);
    
    stroke(0);
    strokeWeight(1);
    fill(255,100,0);
    circle(0,0,this.tamanho);
    
    
    stroke(255);
    strokeWeight(3);
    line(-18, -18, 18, 18);
    line(-18, 18, 18, -18);
    
    fill(0,120,255);
    circle(0,0,25);
    
    noStroke();
    push();
    scale(0.6); 
    translate(0, -5);
    
    fill(255, 165, 0);
    ellipse(-15, 20, 14, 8);
    ellipse(15, 20, 14, 8);

    fill(Pinguim.cor); 
    push(); rotate(PI/4); ellipse(-18, 10, 12, 25); pop();
    push(); rotate(-PI/4); ellipse(18, 10, 12, 25); pop();

    ellipse(0, 0, 40, 55);
    pop();
    
    pop();
  }

  mover() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)){
      this.x -= 5;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)){
      this.x += 5;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
      this.y -= 5;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)){
      this.y += 5;
    }
    
  this.x = constrain(this.x, limiteEsq, limiteDir);
  this.y = constrain(this.y, limiteTopo, limiteBaixo);
    
  }
}

class Obstaculo{
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = 50;
  }

  mover(){
    this.y += 7;
  }

  mostrar(){
  push();
  translate(this.x, this.y);
  noStroke();

  // corpo mais achatado
  fill(40);
  ellipse(0, 15, this.tamanho * 1.1, this.tamanho * 0.8);

  // topo amarrado
  fill(30);
  rectMode(CENTER);
  rect(0, -10, 18, 15, 4);

  // nó
  triangle(-8, -10, 8, -10, 0, -22);

  // detalhe de brilho
  fill(80);
  ellipse(-12, 10, 8, 14);

  pop();
  }
}