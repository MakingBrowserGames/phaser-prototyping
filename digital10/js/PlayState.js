/*
 * Digital 10: PlayState.js
 * Created by Zachary Ferguson
 * Game State Class for playing the main game
 */

"use strict";
 
function PlayState() {};

PlayState.prototype = 
{	
	/* Create the tilemap, player, and groups. */
	create: function()
	{
		console.log("Play");
		
		this.game.world.setBounds(0, 0, 1200, 1200);
		
		/* Create tile map. */
		this.tilemap = this.game.add.tilemap("maze");
		this.tilemap.addTilesetImage("tileset", "tileset");
		this.ground = this.tilemap.createLayer("ground");
		this.walls = this.tilemap.createLayer("walls");
		this.exit = this.tilemap.createLayer("exit");
		/* Set collisions */
		this.tilemap.setCollisionBetween(0, 4, true, this.walls);
		this.tilemap.setCollisionBetween(0, 4, true, this.exit);
		
		/* Create the players sprite. */
		this.player = this.createPlayer(200,0);
		
		/* Create the blades. */
		this.blades = this.game.add.group();
		this.blades.enableBody = true;
		this.blades.collideWorldBounds = true;
		this.createBlades();
		
		/* Create the Key */
		this.key = this.game.add.sprite(23*40, 25*40, "key");
		this.game.physics.arcade.enable(this.key);
		
		/* Load controls */
		this.cursors = this.game.input.keyboard.createCursorKeys();
		
		/* LIGHTING CODE BORROWED FROM                  */
		/* HTTP://GAMEMECHANICEXPLORER.COM/#LIGHTING-1. */
		
		//The radius of the circle of light
		this.LIGHT_RADIUS = 100;

		// Create the shadow texture
		this.shadowTexture = this.game.add.bitmapData(this.game.world.width, 
			this.game.world.height);

		// Create an object that will use the bitmap as a texture
		var lightSprite = this.game.add.image(0, 0, this.shadowTexture);

		// Set the blend mode to MULTIPLY. This will darken the colors of
		// everything below this sprite.
		lightSprite.blendMode = Phaser.blendModes.MULTIPLY;	
		
		/* BORROWED CODE END */
		
		this.healthText = this.game.add.text(20, 0, "Health: " + 
			this.player.health, {fill:"white", font: "12px Courier", 
			align: "center"});
		this.healthText.anchor.setTo(0.5,1.0);
		this.player.addChild(this.healthText);
	},
	
	/* Creates the player sprite.                                        */
	/* Must give an int for the x and y coordinates for where the player */
	/* should be created.                                                */
	createPlayer: function(x, y)
	{
		/* Create the player sprite. */
		var player = this.game.add.sprite(x, y, "player");
		//player.anchor.setTo(0.5, 1.0);
		
		player.animations.add( "down", [ 0,  1,  2,  3], 4, true);
		player.animations.add( "left", [ 4,  5,  6,  7], 4, true);
		player.animations.add("right", [ 8,  9, 10, 11], 4, true);
		player.animations.add(   "up", [12, 13, 14, 15], 4, true);
		
		/* Set the camera to follow the player */
		this.game.camera.follow(player);
		
		/* Enable physics on the player */
		this.game.physics.arcade.enable(player);
		player.body.setSize(24, 36, 8, 4)
		
		/* Collide the player with the world bounds */
		player.body.collideWorldBounds = true;
		player.SPEED = 160;
		
		player.health = 100;
		
		player.hurtSound = this.game.add.sound("hurt");
		
		player.hasKey = false;
		
		return player;
	},
	
	createBlades: function()
	{
		var positions = [[1,5],[1,8],[18,8],[20,15],[17,19],[28,18]];
		for(var i in positions)
		{
			//console.log(pos);
			var blade = this.blades.create(positions[i][0] * 40, 
				positions[i][1] * 40, "blade");
			blade.body.velocity.x = 300;
			blade.animations.add("rotate", [2,1,0], 32, true);
			blade.animations.play("rotate");
			blade.body.bounce.set(1);
		}
	},
	
	/* Update game every frame. */
	update: function()
	{
		this.game.physics.arcade.collide(this.player, this.walls);
		
		this.game.physics.arcade.collide(this.key, this.player, 
			function()
			{
				this.key.kill();
				this.player.hasKey = true;
				this.game.add.sound("pickup").play();
			},null, this);
		
		this.game.physics.arcade.collide(this.player, this.exit, 
			function()
			{
				if(this.player.hasKey)
				{
					this.game.game_over_text = 
						"Congratulations you escaped\nthe maze!";
					this.game.state.start("game over");
				}
			}, null, this);
		
		this.game.physics.arcade.collide(this.blades, this.walls);
		
		this.game.physics.arcade.overlap(this.player, this.blades, 
			function()
			{
				this.player.health--;
				this.healthText.text = "Health: " + this.player.health;
				if(!this.player.hurtSound.isPlaying)
				{
					this.player.hurtSound.play();
				}
				if(this.player.health <= 0)
				{
					this.game.game_over_text = 
						"Game Over\n\nYou died in the maze";				
					this.game.state.start("game over");
				}
			}, null, this);
		
		this.controlPlayer();
		
		if(this.LIGHT_RADIUS > 40)
		{
			this.LIGHT_RADIUS -= 0.01;
		}
		
		// Update the shadow texture each frame
		this.updateShadowTexture();
	},
	
	/* Move the player around the world. */
	controlPlayer: function()
	{
		this.player.body.velocity.setTo(0,0);
		
		if(this.cursors.left.isDown)
		{
			this.player.body.velocity.x = -this.player.SPEED;
			this.player.animations.play("left");
		}
		else if(this.cursors.right.isDown)
		{
			this.player.body.velocity.x = this.player.SPEED;
			this.player.animations.play("right");
		}
		else if(this.cursors.up.isDown)
		{
			this.player.body.velocity.y = -80;
			this.player.animations.play("up");
		}
		else if(this.cursors.down.isDown)
		{
			this.player.body.velocity.y = 80;
			this.player.animations.play("down");
		}
		else
		{
			this.player.animations.stop();
			this.player.frame = 0;
		}
	},
	
	/* Function borrowed from the game mechanic explorer. */
	/* Copyright © 2014 John Watson.                      */
	/* Licensed under the terms of the MIT License.       */
	updateShadowTexture: function()
	{
		// This function updates the shadow texture (this.shadowTexture).
		// First, it fills the entire texture with a dark shadow color.
		// Then it draws a white circle centered on the pointer position.
		// Because the texture is drawn to the screen using the MULTIPLY
		// blend mode, the dark areas of the texture make all of the colors
		// underneath it darker, while the white area is unaffected.

		// Draw shadow
		this.shadowTexture.context.fillStyle = 'rgb(0, 0, 0)';
		this.shadowTexture.context.fillRect(0, 0, this.game.world.width, 
			this.game.world.height);

		// Randomly change the radius each frame
		var radius = this.LIGHT_RADIUS + this.game.rnd.integerInRange(1,10);

		// Draw circle of light with a soft edge
		var gradient = this.shadowTexture.context.createRadialGradient(
			this.player.x+29, this.player.y+24,this.LIGHT_RADIUS * 0.75,
			this.player.x+29, this.player.y+24, radius);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

		this.shadowTexture.context.beginPath();
		this.shadowTexture.context.fillStyle = gradient;
		this.shadowTexture.context.arc(this.player.x+29, this.player.y+24, 
			radius, 0, Math.PI*2);
		this.shadowTexture.context.fill();

		// This just tells the engine it should update the texture cache
		this.shadowTexture.dirty = true;
	}
};