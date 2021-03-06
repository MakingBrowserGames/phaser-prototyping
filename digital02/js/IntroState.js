/*
 * State Class for the introduction text
 * Created by Zachary Ferguson
 */

"use strict";

function IntroState() {};

IntroState.prototype = {
	/* Create the intro sprite */
	create: function()
	{
		/* Play the intro */
		var intro = this.game.add.sprite(0, 0, "title");
		intro.animations.add("role", [0, 1, 2, 3], 0.2);
		intro.animations.play("role");
		this.startTime = (new Date()).getTime();

		/* Play the background music */
		this.music = this.game.add.audio("bg_music", .125, true);
		this.music.play();
	},

	/* Wait 20 seconds to continue */
	update: function()
	{
		var deltaTime = (new Date()).getTime() - this.startTime;
		if(deltaTime > (20*1000))
		{
			/* Wait for animation to end */
			this.game.state.start("overworld");
		}
	}
};
