//variáveis para mover as construções no centro
let posMapa = {
  boiacross: { x: 100, y: 350 },
  mina:      { x: 450, y: 150 },
  loja:      { x: 150, y: 150 }
};

// Parâmetros do pinguin
let Pinguim = {
  x: 300, y: 200,
  targetX: 300, targetY: 200,
  isMovingToTarget: false,
  tamanho: 40,
  velocidadeLerp: 0.03, 
  cor: '#00BFFF', 
  movendo: false,
  anguloWiggle: 0,
  moedas: 50,
  inventario: [], 
  roupas: {       
    cabeca: 'nenhuma',
    rosto: 'nenhuma',
    corpo: 'nenhuma',
    pes: 'nenhuma'
  }
};

let cenaAtual = 'menu';

// Controle do Catálogo
let mostrarCatalogo = false;
let catalogTabs = ["Cores", "Cabeça", "Rosto", "Corpo", "Pés"];
let currentCatalogTab = "Cabeça";
let catalogItems;

let mensagemHUD = "";
let tempoMensagemHUD = 0;

catalogItems = {
    Cabeça: [
      { id: "cabeca1", name: "Gorro Listrado", price: 30, category: 'cabeca' },
      { id: "cabeca2", name: "Chapéu de Hélice", price: 40, category: 'cabeca' }
    ],
    Rosto: [
      { id: "rosto1", name: "Óculos Escuros", price: 25, category: 'rosto' },
      { id: "rosto2", name: "Óculos 3D", price: 50, category: 'rosto' }
    ],
    Corpo: [
      { id: "corpo1", name: "Casaco Vermelho", price: 60, category: 'corpo' },
      { id: "corpo2", name: "Moletom Preto", price: 75, category: 'corpo' }
    ],
    Pés: [
      { id: "pes1", name: "Tênis Branco", price: 30, category: 'pes' },
      { id: "pes2", name: "Bota de Combate", price: 40, category: 'pes' }
    ]
};

function setup() {
  createCanvas(600, 400);
  textAlign(CENTER, CENTER);
}

function draw() {
  switch (cenaAtual) {
    case 'menu': desenharMenu(); break;
    case 'centro':
      desenharCentro();
      atualizarPinguim();
      desenharPinguim();
      desenharMoedasHUD();
      break;
    case 'mina':
      desenharMina();
      atualizarPinguim();
      desenharPinguim();
      desenharMoedasHUD();
      break;
    case 'loja':
      desenharLojaInterior();
      desenharMoedasHUD();
      if (!mostrarCatalogo) atualizarPinguim();
      desenharPinguim();
      if (mostrarCatalogo) desenharInterfaceCatalogo();
      break;
    case 'sospuffle': 
      drawSOSPuffle();
      break;
    
    case 'boiacross': 
      drawBoiacross();
        
      push();
      fill(0); textAlign(CENTER, TOP); textSize(12);
      text("Pressione ESC para Sair", 10, 10);
      if (keyIsDown(ESCAPE)) {
        cenaAtual = 'centro';
        Pinguim.x = posMapa.boiacross.x + 80;
        Pinguim.y = posMapa.boiacross.y;
        Pinguim.isMovingToTarget = false;
      }
      pop();
      break;
  }
  
  if (millis() < tempoMensagemHUD) {
    push();
    fill(0, 200); rect(width/2 - 100, height - 50, 200, 30, 5);
    fill(255); textSize(14); text(mensagemHUD, width/2, height - 35);
    pop();
  }
}

function keyPressed() {
  // Passa o comando do teclado para o SOS Puffle
  if (cenaAtual === 'sospuffle') {
      return keyPressedSOSPuffle();
  }
}

function mousePressed() {
  // Passa o comando do mouse para o boicross
  if (cenaAtual === 'boiacross') {
    if (typeof mousePressedBoiacross === "function") {
      mousePressedBoiacross();
    }
    return;
  }

  // Catalogo aberto
  if (mostrarCatalogo) {
    // Botão Fechar
    if (mouseX > 490 && mouseX < 520 && mouseY > 50 && mouseY < 80) {
        mostrarCatalogo = false; 
        return;
    }

    // Abas do catálogo
    for (let i = 0; i < catalogTabs.length; i++) {
        let abaX = 115;
        let abaY = 110 + i * 35;
        if (mouseX > abaX && 
            mouseX < abaX + 80 && 
            mouseY > abaY && 
            mouseY < abaY + 30){
            currentCatalogTab = catalogTabs[i]; 
            return;
        }
    }
    
    // Itens do catálogo
    if (currentCatalogTab === "Cores") {
      verificarMudarCor(mouseX, mouseY, 230, 150, 50, 50, '#FF4040');
      verificarMudarCor(mouseX, mouseY, 290, 150, 50, 50, '#32CD32');
      verificarMudarCor(mouseX, mouseY, 350, 150, 50, 50, '#1E90FF');
      verificarMudarCor(mouseX, mouseY, 410, 150, 50, 50, '#FF69B4');
      verificarMudarCor(mouseX, mouseY, 230, 210, 50, 50, '#673AB7');
      verificarMudarCor(mouseX, mouseY, 290, 210, 50, 50, '#9E9E9E');
    } 
    else {
      let currentCategoryItems = catalogItems[currentCatalogTab];
      if (!currentCategoryItems) return;
      for (let i = 0; i < currentCategoryItems.length; i++) {
        let item = currentCategoryItems[i];
        let boxX = 230 + (i % 2) * 130;
        let boxY = 130 + floor(i / 2) * 100;
        
        // Botão Comprar/Equipar
        if (mouseX > boxX + 10 &&
            mouseX < boxX + 110 && 
            mouseY > boxY + 70 && 
            mouseY < boxY + 90) {
          verificarCompraRoupa(item); return;
        }
      }
    }
    return;
  }

  // botão abrir catalogo
  if (cenaAtual === 'loja' && !mostrarCatalogo) {
    if (mouseX > 530 && 
        mouseX < 580 && 
        mouseY > 330 && 
        mouseY < 380) {
      mostrarCatalogo = true; 
      Pinguim.isMovingToTarget = false;
      return;
    }
  }

  // Movimentação normal
  if (cenaAtual === 'centro' || 
      cenaAtual === 'mina'   || 
      cenaAtual === 'loja') {
    Pinguim.targetX = mouseX;
    Pinguim.targetY = mouseY;
    Pinguim.isMovingToTarget = true;
  }
}

//sistema de trigger para mudança de cena
function verificarTrigger(x, y, raio, nomeAlvo, cenaDestino, pxSpawn, pySpawn) {
  noFill(); 
  stroke(255, 255, 255, 100); 
  strokeWeight(2); 
  drawingContext.setLineDash([5, 5]);
  ellipse(x, y, raio * 2); 
  drawingContext.setLineDash([]);
  
  if (dist(Pinguim.x, Pinguim.y, x, y) < raio) {
    cenaAtual = cenaDestino;
    Pinguim.x = pxSpawn; 
    Pinguim.y = pySpawn;
    Pinguim.isMovingToTarget = false;
    Pinguim.targetX = pxSpawn; 
    Pinguim.targetY = pySpawn;
    exibirMensagemHUD("Entrando em " + nomeAlvo);
    
    if (cenaDestino === 'boiacross')
      setupBoiacross();
    if (cenaDestino === 'sospuffle')
      setupSOSPuffle();
  }
}

//carregar pinguim
function atualizarPinguim() {
  Pinguim.movendo = false;
  if (Pinguim.isMovingToTarget) {
    let d = dist(Pinguim.x, Pinguim.y, Pinguim.targetX, Pinguim.targetY);
    if (d > 2) {
      Pinguim.x = lerp(Pinguim.x, Pinguim.targetX, Pinguim.velocidadeLerp);
      Pinguim.y = lerp(Pinguim.y, Pinguim.targetY, Pinguim.velocidadeLerp);
      Pinguim.movendo = true;
    } else {
      Pinguim.isMovingToTarget = false;
    }
  }

  Pinguim.x = constrain(Pinguim.x, Pinguim.tamanho/2, width - Pinguim.tamanho/2);
  Pinguim.y = constrain(Pinguim.y, Pinguim.tamanho/2, height - Pinguim.tamanho/2);

  if (Pinguim.movendo) 
    Pinguim.anguloWiggle = sin(frameCount * 0.15) * 0.2; 
  else 
    Pinguim.anguloWiggle = lerp(Pinguim.anguloWiggle, 0, 0.1);
}

function desenharPinguim() {
  push(); 
  translate(Pinguim.x, Pinguim.y); 
  rotate(Pinguim.anguloWiggle); 
  noStroke();
  
  // pés
  if (Pinguim.roupas.pes === "pes1") 
    desenharPesTênis();
  else if (Pinguim.roupas.pes === "pes2") 
    desenharPesBotas();
  else { 
    fill(255, 165, 0); 
    ellipse(-15, 25, 14, 8); 
    ellipse(15, 25, 14, 8); 
  }

  // Nadadeiras
  fill(Pinguim.cor); 
  push(); rotate(PI/6); ellipse(-14, 18, 12, 25); pop(); 
  push(); rotate(-PI/6); ellipse(14, 18, 12, 25); pop();

  // Corpo
  fill(Pinguim.cor); 
  ellipse(0, 5, Pinguim.tamanho, Pinguim.tamanho + 15); 
  fill(255); 
  ellipse(0, 10, Pinguim.tamanho - 12, Pinguim.tamanho); 
  
  // Roupas do Corpo
  if (Pinguim.roupas.corpo === "corpo1") 
    desenharCorpoJaqueta();
  else if (Pinguim.roupas.corpo === "corpo2") 
    desenharCorpoCasaco();

  // Olhos e Bico
  fill(0); ellipse(-8, -6, 5, 7); ellipse(8, -6, 5, 7); 
  fill(255, 165, 0); triangle(-6, 0, 6, 0, 0, 8); 

  // Rosto
  if (Pinguim.roupas.rosto === "rosto1") 
    desenharRostoOculosEscuros();
  else if (Pinguim.roupas.rosto === "rosto2") 
    desenharRostoOculos3D();
  
  // Cabeça
  if (Pinguim.roupas.cabeca === "cabeca1") 
    desenharCabecaToca();
  else if (Pinguim.roupas.cabeca === "cabeca2") 
    desenharCabecaHelice();

  pop();
}

// funções roupas
function desenharPesTênis() { 
  fill(255); 
  rect(-20, 20, 12, 10, 2); 
  rect(8, 20, 12, 10, 2); 
  fill(200); 
  rect(-20, 28, 12, 2); 
  rect(8, 28, 12, 2); 
}

function desenharPesBotas() { 
  fill(30); 
  rect(-20, 18, 12, 12, 2); 
  rect(8, 18, 12, 12, 2); 
}

function desenharCorpoJaqueta() { 
  fill('#FF4040'); 
  rect(-17, 1, 34, 25, 8); 
  fill('#FF7070'); 
  rect(-17, 10, 34, 10); 
  fill(200); 
  rect(-2, 1, 4, 25); 
}

function desenharCorpoCasaco() { 
  fill(30); 
  rect(-17, 1, 34, 25, 8); 
  fill(255); 
  rect(-10, 10, 20, 10, 5); 
}

function desenharRostoOculosEscuros() { 
  fill(0); 
  rect(-14, -10, 12, 8, 2); 
  rect(2, -10, 12, 8, 2); 
  stroke(0); 
  strokeWeight(2); 
  line(-2, -6, 2, -6); 
  noStroke(); 
}

function desenharRostoOculos3D() { 
  fill('#1E90FF'); 
  rect(-14, -10, 12, 8, 2); 
  fill('#FF4040'); 
  rect(2, -10, 12, 8, 2); 
  fill(255); 
  rect(-14, -10, 12, 2); 
  rect(2, -10, 12, 2); 
  stroke(0); 
  line(-2, -6, 2, -6); 
  noStroke(); 
}

function desenharCabecaToca() { 
  fill('#FF4040'); 
  arc(0, -20, 26, 20, PI, 0); 
  fill('#1E90FF'); 
  rect(-13, -20, 26, 5); 
  fill(255); 
  ellipse(0, -32, 8, 8); 
}

function desenharCabecaHelice() { 
  fill('#32CD32'); 
  arc(0, -20, 20, 15, PI, 0); 
  fill('#FFD700'); 
  rect(-10, -20, 20, 3); 
  fill(150); 
  rect(-1, -30, 2, 8); 
  fill('#FF4040'); 
  ellipse(0, -32, 16, 4); 
}

// compra
function verificarMudarCor(mx, my, x, y, w, h, cor) {
  if (mx > x && 
      mx < x + w && 
      my > y && 
      my < y + h) {
    if (Pinguim.moedas >= 5) { 
      Pinguim.moedas -= 5; 
      Pinguim.cor = cor; 
      exibirMensagemHUD("Cor alterada! (-5 moedas)"); 
    } 
    else 
      exibirMensagemHUD("Moedas insuficientes!");
  }
}

function verificarCompraRoupa(item) {
  if (Pinguim.inventario.includes(item.id)) {
    Pinguim.roupas[item.category] = item.id;
    exibirMensagemHUD("Equipado: " + item.name);
    return;
  }
  
  if (Pinguim.moedas >= item.price) {
    Pinguim.moedas -= item.price;
    Pinguim.roupas[item.category] = item.id;
    Pinguim.inventario.push(item.id);
    exibirMensagemHUD("Comprado: " + item.name);
  } else { 
    exibirMensagemHUD("Moedas insuficientes!"); 
  }
}

function exibirMensagemHUD(msg) { 
  mensagemHUD = msg; 
  tempoMensagemHUD = millis() + 2000; 
}

// Desenhos cenário
function desenharCentro() { 
  background(255); 
  fill(240); 
  ellipse(width/2, height/2 + 100, width*1.5, 200); 
  
  elementoBoiacross(posMapa.boiacross.x, posMapa.boiacross.y); 
  elementoMina(posMapa.mina.x, posMapa.mina.y); 
  elementoLoja(posMapa.loja.x, posMapa.loja.y); 
   
}

function elementoBoiacross(x, y) { 
  push(); 
  translate(x, y); 
  fill(135, 206, 235); 
  stroke(200, 230, 255); 
  strokeWeight(4); 
  ellipse(0, 50, 240, 160); 
  noStroke(); 
  fill(255, 255, 255, 100); 
  ellipse(-20, -10, 40, 15); 
    push(); 
    rotate(PI/8); 
    fill(200,40,40); 
    rect(-25,-25,50,20,5); 
    pop(); 
  pop(); 
  verificarTrigger(x, y, 40, "BOIACROSS", 'boiacross', 200, 200); 
}

function elementoMina(x, y) { 
  push(); 
  translate(x, y); 
  noStroke(); 
  fill(240); 
  ellipse(0, 20, 140, 80); 
  fill(90, 85, 80); 
  arc(0, 20, 120, 120, PI, 0); 
  fill(20); 
  arc(0, 20, 80, 80, PI, 0); 
  stroke(101, 67, 33); 
  strokeWeight(8); 
  strokeCap(SQUARE);
  line(-40, 20, -40, -10); 
  line(40, 20, 40, -10); 
  line(-45, -10, 45, -10); 
  noStroke(); 
  fill(100, 70, 40); 
  rect(-20, 25, 40, 4); 
  rect(-25, 35, 50, 4); 
  fill(100); 
  rect(-12, 20, 4, 20); 
  rect(8, 20, 4, 20); 
  fill(255, 204, 0); 
  triangle(-50, 0, -35, 20, -65, 20); 
  fill(0); 
  textSize(12); 
  text("!", -50, 12); 
  pop(); 
  verificarTrigger(x, y + 10, 40, "MINA", 'mina', 300, 320); 
}

function elementoLoja(x, y) {
  push(); 
  translate(x, y); 
  rectMode(CENTER); 
  noStroke();
  fill(100, 90, 80); 
  rect(0, 0, 160, 140); 
  fill(120, 110, 100); 
  rect(0, -60, 160, 40);
  fill(255); 
  arc(0, -80, 180, 60, PI, 0); 
  fill(230, 230, 230, 100); 
  ellipse(0, -75, 180, 15);
  fill(200, 150, 200); 
  rect(0, 15, 150, 20); 
  fill(150, 100, 150); 
  rect(0, 15, 154, 2); 
  fill(255); 
  textSize(12); 
  text("CLOTHES SHOP", 10, 15);
  fill(100); 
  rect(-50, -40, 6, 12); 
  rect(-10, -40, 6, 12); 
  rect(30, -40, 6, 12); 
  fill(255, 255, 0); 
  ellipse(-50, -35, 10, 10); 
  ellipse(-10, -35, 10, 10); 
  ellipse(30, -35, 10, 10);
  fill(0, 50, 150); 
  rect(-20, -10, 40, 30); 
  fill(255); 
  triangle(-20, -15, -15, -10, -20, -5);
  fill(80); 
  rect(-60, 50, 20, 30); 
  fill(150); 
  rect(-60, 45, 10, 10);
  fill(200, 220, 255, 100); 
  rect(40, 50, 70, 40); 
  fill(150); 
  ellipse(25, 55, 15, 20); 
  fill(180); 
  ellipse(55, 55, 15, 20);
  pop();
  verificarTrigger(x - 60, y + 50, 25, "LOJA", 'loja', 300, 300);
}

function desenharLojaInterior() {
  background(240, 220, 240); 
  fill(210, 170, 210); 
  rect(0, 0, width, height / 2); 
  fill(180, 140, 180); 
  rect(0, height / 2, width, 10); 

  fill(160, 120, 80); 
  rect(450, 150, 100, 60, 5);
  fill(160, 80, 80); 
  rect(30, 80, 100, 130);
  
  fill(0, 100, 200); 
  rect(530, 330, 50, 40, 3); 
  fill(255); 
  textSize(10); 
  text("Catálogo\n(Clique)", 555, 350);

  verificarTrigger(300, 350, 40, "CENTRO", 'centro', posMapa.loja.x - 60, posMapa.loja.y + 80);
}

function desenharInterfaceCatalogo() {
  push();
  fill(255); 
  noStroke();
  rectMode(CORNER);
  rect(100, 50, 420, 320, 10);
  
  fill(240);
  rect(110, 60, 400, 300, 5);
  
  fill(0); 
  textSize(24); 
  textAlign(CENTER);
  text("Catálogo Clothes Shop", 310, 90);
  
  fill(200, 50, 50); 
  rect(490, 50, 30, 30, 0, 10, 0, 0);
  fill(255); 
  textSize(16); 
  text("X", 505, 72);
  pop();

  for (let i = 0; i < catalogTabs.length; i++) {
    push();
    fill(currentCatalogTab === catalogTabs[i] ? color(180) : color(220));
    rect(115, 110 + i * 35, 80, 30, 5);
    fill(0); 
    textSize(12); 
    textAlign(CENTER, CENTER);
    text(catalogTabs[i], 155, 125 + i * 35);
    pop();
  }

  let currentCategory = currentCatalogTab;
  if (currentCatalogTab === "Cores") {
    fill(0); textSize(16); textAlign(CENTER);
    text("Escolha sua nova cor (5 Moedas)", 310, 130);
    
    fill('#FF4040'); rect(230, 150, 50, 50, 5); // Vermelho
    fill('#32CD32'); rect(290, 150, 50, 50, 5); // Verde
    fill('#1E90FF'); rect(350, 150, 50, 50, 5); // Azul
    fill('#FF69B4'); rect(410, 150, 50, 50, 5); // Rosa
    fill('#673AB7'); rect(230, 210, 50, 50, 5); // Roxo
    fill('#9E9E9E'); rect(290, 210, 50, 50, 5); // Cinza
  }
  else if (currentCategory) {
    let items = catalogItems[currentCategory];
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let boxX = 210 + (i % 2) * 150;
      let boxY = 120 + floor(i / 2) * 110;
      
      fill(255); stroke(200); rect(boxX, boxY, 130, 100, 5);
      
      push();
      translate(boxX + 65, boxY + 30);
      scale(0.6); // Miniatura
      if (item.id === "cabeca1") desenharCabecaToca();
      if (item.id === "cabeca2") desenharCabecaHelice();
      if (item.id === "rosto1") desenharRostoOculosEscuros();
      if (item.id === "rosto2") desenharRostoOculos3D();
      if (item.id === "corpo1") desenharCorpoJaqueta();
      if (item.id === "corpo2") desenharCorpoCasaco();
      if (item.id === "pes1") desenharPesTênis();
      if (item.id === "pes2") desenharPesBotas();
      pop();
      
      noStroke(); 
      fill(0); 
      textSize(10); 
      textAlign(CENTER);
      text(item.name, boxX + 65, boxY + 65);
      fill(100); 
      text(item.price + " moedas", boxX + 65, boxY + 78);
      
      let isOwned = Pinguim.inventario.includes(item.id);
      fill(isOwned ? color(100, 200, 100) : color(0, 150, 50));
      rect(boxX + 15, boxY + 82, 100, 15, 5);
      fill(255); 
      textSize(9); 
      text(isOwned ? "EQUIPAR" : "COMPRAR", boxX + 65, boxY + 93);
    }
  } 
}

function desenharMenu() { 
  background(0, 153, 255); 

  noStroke();
  fill(255, 255, 255, 200);
  ellipse(120, 80, 100, 40);
  ellipse(160, 90, 80, 30);
  ellipse(480, 110, 120, 50);
  ellipse(520, 120, 90, 40);

  fill(220, 240, 255);
  triangle(0, 350, 120, 120, 280, 350);
  triangle(180, 350, 380, 80, 580, 350);
  triangle(450, 350, 580, 160, 650, 350);

  fill(255);
  ellipse(width / 2, height, width * 1.5, 250);

  textAlign(CENTER, CENTER);
  textSize(55);
  textStyle(BOLD);

  fill(0, 50, 100);
  text("CLUB PENGUIN", width / 2 + 5, height / 3 + 5);

  fill(255, 204, 0); 
  stroke(0);
  strokeWeight(5);
  text("CLUB PENGUIN", width / 2, height / 3);

  let btnW = 200;
  let btnH = 60;
  let btnX = width / 2 - btnW / 2;
  let btnY = height / 2 + 30;
  
  let hover = mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH;

  if (hover) {
    fill(255, 180, 0);
    cursor(HAND);
  } else {
    fill(255, 140, 0);
    cursor(ARROW);
  }

  stroke(255);
  strokeWeight(3);
  rect(btnX, btnY, btnW, btnH, 30);

  noStroke();
  fill(255);
  textSize(26);
  text("JOGAR", width / 2, btnY + btnH / 2);

// 7. Mini Puffle Vermelho decorativo (Estilo felpudo e estático)
  let cx = 100;
  let cy = 350;

  // Brilho/glow
  noStroke();
  fill(255, 80, 40, 18);
  ellipse(cx, cy + 2, 54, 54);

  // Pelo felpudo ao redor
  fill(210, 55, 20); // Vermelho escuro
  for (let i = 0; i < 12; i++) {
    let a = (TWO_PI / 12) * i;
    let fx = cx + cos(a) * 16;
    let fy = cy + sin(a) * 16;
    let fs = 7 + sin(a * 3) * 2;
    ellipse(fx, fy, fs, fs);
  }

  // Corpo principal vermelho
  fill(230, 60, 30);
  ellipse(cx, cy, 28, 28);

  // Highlight de volume
  fill(255, 120, 80, 160);
  ellipse(cx - 4, cy - 5, 12, 12);

  // Tufão de pelo no topo (adaptado para elipses estáticas, sem rotação)
  fill(210, 45, 15);
  ellipse(cx - 5, cy - 16, 7, 10); // Mecha esquerda
  ellipse(cx, cy - 19, 7, 11);     // Mecha central
  ellipse(cx + 5, cy - 16, 7, 10); // Mecha direita

  // Olho esquerdo
  fill(255);
  ellipse(cx - 7, cy - 3, 13, 13); // Fundo
  fill(20, 20, 50);
  ellipse(cx - 6, cy - 3, 8, 8);   // Pupila
  fill(255);
  ellipse(cx - 4, cy - 6, 2.5, 2.5); // Brilho

  // Olho direito
  fill(255);
  ellipse(cx + 7, cy - 3, 13, 13); // Fundo
  fill(20, 20, 50);
  ellipse(cx + 8, cy - 3, 8, 8);   // Pupila
  fill(255);
  ellipse(cx + 10, cy - 6, 2.5, 2.5); // Brilho

  // Boquinha feliz
  stroke(160, 30, 10);
  strokeWeight(1.5);
  noFill();
  arc(cx, cy + 5, 10, 7, 0, PI);
  noStroke();
  
  if (hover && mouseIsPressed) {
    cenaAtual = 'centro';
    cursor(ARROW);
  }
}

function desenharMina() { 
  background(40, 35, 30); fill(90, 70, 50); ellipse(width/2, height, width * 1.5, height + 100); 
  fill(25, 20, 15); ellipse(100, 100, 150, 80); ellipse(500, 80, 120, 100);
  fill(70, 45, 25); rect(40, 0, 40, height); rect(width - 80, 0, 40, height); rect(0, 30, width, 30);
  desenharLanterna(60, 60); desenharLanterna(width - 60, 60);
  stroke(60, 40, 20); strokeWeight(6);
  for(let i = 0; i < 6; i++) line(230, 150 + (i*40), 370, 150 + (i*40)); 
  noStroke(); fill(120); rect(250, 130, 8, 250); rect(342, 130, 8, 250);
  fill(10); arc(300, 150, 140, 140, PI, 0);
  fill(139, 69, 19); rect(240, 40, 120, 40, 5);
  fill(255); textSize(16); text("SOS Puffle", 300, 60); 
  verificarTrigger(300, 130, 40, "SOS PUFFLE", 'sospuffle', 300, 250); 
  verificarTrigger(300, 380, 40, "CENTRO", 'centro', posMapa.mina.x, posMapa.mina.y + 60); 
}

function desenharLanterna(x, y) {
  push(); translate(x, y); noStroke();
  fill(255, 200, 0, 80); ellipse(0, 25, 80, 80); fill(255, 220, 0, 150); ellipse(0, 25, 40, 40); 
  stroke(0); strokeWeight(3); line(0, -20, 0, 5); noStroke();
  fill(50); rect(-12, 5, 24, 6); fill(40); rect(-15, 11, 30, 28, 5); 
  fill(255, 230, 100); rect(-10, 14, 20, 22, 3);
  fill(255, 100, 0); ellipse(0, 30, 12, 12); 
  pop();
}

function desenharMoedasHUD() {
  push();
  let x = 70;
  let y = 30;

  rectMode(CENTER);
  fill(0, 0, 0, 150);
  noStroke();
  rect(x, y, 140, 40, 20);

  fill(255, 215, 0);
  ellipse(x - 45, y, 25, 25);
  fill(218, 165, 32);
  textAlign(CENTER, CENTER);
  textSize(16);
  textStyle(BOLD);
  text("$", x - 45, y);

  fill(255);
  textAlign(LEFT, CENTER);
  textSize(18);
  text(Pinguim.moedas, x - 25, y);
  pop();
}