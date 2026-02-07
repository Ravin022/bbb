// Test Game - Simulated game with various value types for testing GVM
(function() {
  'use strict';

  window.TestGame = {
    player: {
      name: 'Hero',
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      level: 1,
      experience: 0,
      gold: 250,
      attack: 15,
      defense: 10,
      speed: 5,
      position: { x: 100, y: 200 },
      alive: true
    },
    inventory: {
      potions: 3,
      arrows: 20,
      keys: 1,
      items: ['sword', 'shield', 'potion']
    },
    world: {
      time: 0,
      day: 1,
      weather: 'sunny',
      difficulty: 1.0,
      enemies: [
        { name: 'Goblin', hp: 30, attack: 5 },
        { name: 'Orc', hp: 80, attack: 12 },
        { name: 'Dragon', hp: 500, attack: 50 }
      ],
      score: 0
    }
  };

  // Simulate game loop - values change over time
  var gameLoop = null;
  var tickCount = 0;

  function gameTick() {
    tickCount++;
    var game = window.TestGame;

    // Time advances
    game.world.time += 1;
    if (game.world.time >= 100) {
      game.world.time = 0;
      game.world.day++;
    }

    // Score increases
    game.world.score += Math.floor(Math.random() * 5);

    // Player takes occasional damage
    if (tickCount % 10 === 0 && game.player.health > 0) {
      var dmg = Math.floor(Math.random() * 5) + 1;
      game.player.health = Math.max(0, game.player.health - dmg);
      if (game.player.health <= 0) {
        game.player.alive = false;
      }
    }

    // Mana regenerates
    if (game.player.mana < game.player.maxMana) {
      game.player.mana = Math.min(game.player.maxMana, game.player.mana + 1);
    }

    // Experience ticks up
    game.player.experience += 1;
    if (game.player.experience >= game.player.level * 100) {
      game.player.experience = 0;
      game.player.level++;
      game.player.attack += 2;
      game.player.defense += 1;
    }

    // Update display
    updateDisplay();
  }

  function updateDisplay() {
    var game = window.TestGame;
    var el = document.getElementById('game-display');
    if (!el) return;

    el.innerHTML = [
      '<div class="game-stat"><span>Name:</span> ' + game.player.name + '</div>',
      '<div class="game-stat"><span>HP:</span> <div class="bar"><div class="bar-fill hp" style="width:' + (game.player.health / game.player.maxHealth * 100) + '%"></div></div> ' + game.player.health + '/' + game.player.maxHealth + '</div>',
      '<div class="game-stat"><span>Mana:</span> <div class="bar"><div class="bar-fill mana" style="width:' + (game.player.mana / game.player.maxMana * 100) + '%"></div></div> ' + game.player.mana + '/' + game.player.maxMana + '</div>',
      '<div class="game-stat"><span>Level:</span> ' + game.player.level + '</div>',
      '<div class="game-stat"><span>XP:</span> ' + game.player.experience + '/' + (game.player.level * 100) + '</div>',
      '<div class="game-stat"><span>Gold:</span> ' + game.player.gold + '</div>',
      '<div class="game-stat"><span>ATK:</span> ' + game.player.attack + ' | <span>DEF:</span> ' + game.player.defense + '</div>',
      '<div class="game-stat"><span>Potions:</span> ' + game.inventory.potions + '</div>',
      '<div class="game-stat"><span>Arrows:</span> ' + game.inventory.arrows + '</div>',
      '<div class="game-stat"><span>Score:</span> ' + game.world.score + '</div>',
      '<div class="game-stat"><span>Day:</span> ' + game.world.day + ' | <span>Time:</span> ' + game.world.time + '</div>',
      '<div class="game-stat"><span>Status:</span> ' + (game.player.alive ? 'Alive' : 'DEAD') + '</div>'
    ].join('');
  }

  window.TestGame.start = function() {
    if (gameLoop) clearInterval(gameLoop);
    window.TestGame.player.health = 100;
    window.TestGame.player.alive = true;
    tickCount = 0;
    gameLoop = setInterval(gameTick, 500);
    updateDisplay();
  };

  window.TestGame.stop = function() {
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
  };

  // Auto-start
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() { window.TestGame.start(); }, 100);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      window.TestGame.start();
    });
  }
})();
