/*
  Viral Defence

  Authored By Seb Walker <isolationentertainment20@gmail.com>
  Built using DroidScript <http://droidscript.org/>

*/


//Variables
var s_viruses = []
var gravity = 1/gfx.height
var stormTimer
//Handle game loading.
function StormLoad()
{
	//Pre-load the virus texture.
	virus_texture = gfx.CreateTexture( "Img/Viral Defence.png" )
}

function StormStart()
{
    storm = true
    setTimeout(RemoveAll,50)
    setTimeout(function(){gfx.Vibrate( "0,2000" );},200);
}
//Add a virus to scene.
function Addvirus() 
{
    var size = 0.03+0.1*Math.random()
    
	var virus = gfx.CreateBasicSprite( virus_texture )
	virus.width = 1.6 * size
	virus.height = size
	virus.vx = 0
	virus.vy = ((Math.random()*10)-5) / gfx.height
	
	virus.x = Math.random() * (0.85 - 0.02) + 0.02;
	virus.y = -0.2
	s_viruses.push(virus)
	
	gfx.AddSprite( virus )

}

//Update virus positions.
function StormAnimate()
{
    if (s_viruses.length<=100) Addvirus()
    else { GameOver(); return; }
    
	
	for (var i = 0; i < s_viruses.length; i++) 
	{
		var virus = s_viruses[i]
		
		virus.x += virus.vx
		virus.y += virus.vy
		virus.vy += gravity
	
		if (virus.x > 1)
		{
			virus.vx *= -1
			virus.x = 1
		}
		else if (virus.x < 0)
		{
			virus.vx *= -1
			virus.x = 0
		}
		
		if (virus.y > 0.9)
		{
			virus.vy *= -0.45
			virus.y = 0.9
			if (Math.random() > 0.5)
				virus.vy -= Math.random() * 6 / gfx.height
		} 
		else if (virus.y < 0)
		{
			virus.vy = 0;
			virus.y = 0
		}
	}
}
