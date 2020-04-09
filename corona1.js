//_isWebView = true;
gfx.Script("animation.js");
gfx.Script("sprites.js");
gfx.Script("levels.js");

//Global variables
var gameOver = false
var paused = true
var gravity = 10
var score = "000000000"
var paperScore = 1
var pastaScore = 0
var viruses = []
var drops = [];
var rolls = [];
var dropFired = false;
var shipDestroyed = false
var difficulty = 1;
var masked = false;

var bossFight = false;
var bossNo = 1;
var hitCounter = 0;

var maskFreq = 30000
var pastaFreq = 20000
var paperFreq = 10000
var virusFreq = 500
var xDir = 1
var updated = true;
var levelUpdated = false;
var level = 0;
var currLevel = 0;
var scoreCounter = 0;
var immuneSys = 100

//Handle game loading.
function OnLoad()
{
    
	back = gfx.CreateBackground( "Img/back.png" )
	face = gfx.CreateSprite( "Img/face_2898x2090x3x11" )
	//back2 = gfx.CreateBackground( "Img/back_blk.png" )
	black = gfx.CreateSprite( "Img/back_blk.png" )
	replay = gfx.CreateSprite( "Img/replay.png" )
	score = gfx.CreateText( score.toString(), 0.04, "Img/Desyrel.xml" );
	immune = gfx.CreateText( immuneSys.toString() + "% Immune", 0.03, "Img/Desyrel.xml" );
	pastaTxt = gfx.CreateText( pastaScore.toString() , 0.03, "Img/Desyrel.xml" );
	paperTxt = gfx.CreateText( paperScore.toString() , 0.03, "Img/Desyrel.xml" );
    
    screens = gfx.CreateSprite( "Img/screens_1440x1280x2x1")
    //Create graphical objects.
    //Create sprites.
	ship = gfx.CreateSprite( "Img/pure_1440x1800x4x5", "ships" )
    drop = gfx.CreateSprite( "Img/drop_384x512x3x4", "drops" )
	rock = gfx.CreateSprite( "Img/corona_256x512x1x2", "rocks" )
	paper = gfx.CreateSprite("Img/paper_1024x1024x4x2", "g_papers" )
	mask = gfx.CreateSprite("Img/mask_492x536x3x4", "masks" )
	paperIcon = gfx.CreateSprite("Img/paperIcon.png")
	pasta = gfx.CreateSprite("Img/pasta_560x560x2x2", "pastas" )
	pastaIcon = gfx.CreateSprite("Img/pasta_560x560x2x2", "pastas" )
    //gameover = gfx.CreateSprite( "Img/game_over.png", "gameover" )
    boss = gfx.CreateSprite("Img/boss_2688x2700x7x6", "boss" )
    
    rollButton = gfx.CreateSprite("Img/paperIcon.png")
    roll = gfx.CreateSprite( "Img/paper_1024x1024x4x2" )
    
    //Create sounds.
	//jungle = gfx.CreateSound( "Snd/jungle.mp3" )
	pop = gfx.CreateSound( "Snd/pop.mp3" )
	open = gfx.CreateSound( "Snd/open.mp3" )
	close = gfx.CreateSound( "Snd/close.mp3" )
	sqrt = gfx.CreateSound( "Snd/sqrt.mp3" )
	sqrt2 = gfx.CreateSound( "Snd/sqrt2.mp3" )
	cough = gfx.CreateSound( "Snd/cough.mp3" )
	cough2 = gfx.CreateSound( "Snd/cough2.mp3" )
	
	
	music1 = gfx.CreateSound( "Snd/Digital Voyage.mp3" )
	music2 = gfx.CreateSound( "Snd/Mega Rust.mp3" )
	music3 = gfx.CreateSound( "Snd/8bit_Dungeon_Boss_Video_Classica.mp3" )
	music4 = gfx.CreateSound( "Snd/NES Boss.mp3" )
	
	tpSound = gfx.CreateSound( "Snd/tp.mp3" )
	maskSound = gfx.CreateSound( "Snd/mask.mp3" )
	pastaSound = gfx.CreateSound( "Snd/pasta.mp3" )
	bossDieSound = gfx.CreateSound( "Snd/boss_death.mp3" )
	
	tpHitSnd = gfx.CreateSound( "Snd/tp_hit.mp3" )
	bossHitSnd = gfx.CreateSound( "Snd/boss_hit.mp3" )
}

function OnReady()
{
    //show splash
    
    //Add delay to allow music to load
    setTimeout(AddAssets, 2500)   
}

//Called when game has loaded.
function AddAssets()
{
	//Set background.
	//gfx.AddBackground( back )
	
	backColor = gfx.CreateRectangle(1, 1, 0xfffdad )
	gfx.AddGraphic( backColor, 0 , 0 )
	
	//Set background.
	gfx.AddSprite( face, 0, 0.886, 1 )
	
	gfx.AddSprite( pasta, 0.85, 0.08, 0.1 )
	
	
	gfx.AddSprite( pastaIcon, 0.85, 0.08, 0.1 )
	gfx.AddSprite( paperIcon, 0.86, 0.15, 0.08 )
	gfx.AddText( pastaTxt, 0.8, 0.09 );
	gfx.AddText( paperTxt, 0.8, 0.15 );
    
    //Add score text
	gfx.AddText( score, 0, 0 );
	gfx.AddText( immune, 0.6, 0.01 );
	
	//Add game objects to screen.
	AddShip()
    //Add rocks every so often
	
	gfx.AddSprite( screens, 0, 0, 1,1 )
	//Start the game.
    gfx.Play()
}

function StartGame()
{
    paused = false
    gfx.RemoveSprite(screens)
    
    setTimeout(AddRock, virusFreq)
    
	setTimeout(AddPaper, paperFreq + (difficulty*1000) + Math.random()*paperFreq)
	setTimeout(AddPasta, pastaFreq + (difficulty*1000) + Math.random()*pastaFreq)
	setTimeout(AddMask, maskFreq + (difficulty*1000) + Math.random()*pastaFreq)
	
	setTimeout(Cough, 10000 + Math.random()*10000)
	setInterval(Blink, 2000 + 2000*Math.random())
	//setInterval(Cough, 2000 + 2000*Math.random())
	music1.Play(true)
	
	AddRollButton()
}

//Handle key presses and screen touches.
function OnControl( touchState, touchX, touchY, keyState, key )
{
	//Check for arrow keys or joystick touches
	if( key=="ArrowLeft" || leftStick.Contains(touchX,touchY) && touchState=="Down" ) 
	{ 
		ship.AddVelocity( 0, 0, -0.2 )
		ship.PlayRange(8,10,0.5)
	}		
	else if( key=="ArrowRight" || rightStick.Contains(touchX,touchY) && touchState=="Down" ) 
	{ 
		ship.AddVelocity( 0, 0, 0.2 )
		ship.PlayRange(6,8,-0.5) 
	}
	else if( key=="ArrowUp" || fwdStick.Contains(touchX,touchY) && touchState=="Down" ) 
		ship.AddVelocity( 0, -0.1, 0, true )	
		
	else if( key=="ArrowDown" || revStick.Contains(touchX,touchY) && touchState=="Down" ) 
		ship.AddVelocity( 0, 0.1, 0, true )	
	
	//Check for fire key (space bar)
	else if( key==" " || fireBtn.Contains(touchX,touchY) ) 
		FireMissile()
	
	//Else straighten up ship
	else ship.PlayTo( 8 )
}

//Handle key presses and screen touches.
function OnControl( touchState, touchX, touchY, keyState, key )
{
	console.log(keyState)
	console.log(key)
	if (rollButton.Contains(touchX,touchY) && touchState=="Down" && rollButton.active == true) FireRoll();
    
	if(!gameOver && !paused && touchState && !rollButton.Contains(touchX,touchY))
	{
    	if(touchState == "Down" ) 
    	{
    	    ship.Play(0, 0.9)
	        ship.StopAt(10)
	        open.Play()
    	}

    	else if(touchState == "Move" ) 
    	{
    	    ship.x = touchX-0.2
    	}
    	else if(touchState == "Up" ) 
    	{
    	    ship.Play(12, 0.9)
	        ship.StopAt(20)
	        close.Play()
    	}
    	
		if( !dropFired )
		{
		    dropFired = true;
		    //ship.PlayRange(6,12,0.9)
		    ship.Play(6, 0.9)
	        ship.StopAt(12)
	        //sqrt.Play()
	        var pick = Math.random()
            if ( pick >= 0.5 ) sqrt.Play()
            else sqrt2.Play()
	        setTimeout(FireDrop, 50)
		}
	}
	else if(!gameOver && !paused && keyState)
	{
	    if(key=="ArrowLeft") ship.x += 0.01
    	else if(key=="ArrowRight") ship.x -= 0.01
    	
    	else if( key==" ")
    	{
    	    ship.Play(0, 0.9)
	        ship.StopAt(10)
	        open.Play()
	        
	        if( !dropFired )
    		{
    		    dropFired = true;
    		    //ship.PlayRange(6,12,0.9)
    		    ship.Play(6, 0.9)
    	        ship.StopAt(12)
    	        //sqrt.Play()
    	        var pick = Math.random()
                if ( pick >= 0.5 ) sqrt.Play()
                else sqrt2.Play()
    	        setTimeout(FireDrop, 50)
    		}
    		
    		ship.Play(12, 0.9)
	        ship.StopAt(20)
	        close.Play()
    	}
    	else if( key=="r" && rollButton.active == true) 
    	{
    	   FireRoll();
    	}
	}
	
	else if (paused)
	{
	   if(touchState && touchY>=0.6 || key==" ") 
    	{
    	    StartGame()
    	}
	}
	
	else if( gameOver && replay.Contains(touchX,touchY) && touchState=="Down" || key==" ") 
	{ 
          gfx.Reload();
	}	
}

function move(dir)
{

}

function ResetFired()
{
    dropFired = false;
}



function UpdateImmune(points)
{
    immuneSys -= points;
    if(immuneSys >= 100) immuneSys = 100
    // Format the score text with leading zeros
    var scoreText = immuneSys.toString();
    immune.SetText( scoreText + "% Immune" ) 
    
    if(immuneSys <= 0) GameOver()
}

function UpdatePaperScore(val)
{
    paperScore += val
    var scoreText = paperScore.toString();
    paperTxt.SetText( scoreText ) 
    if (paperScore == 1 ) AddRollButton()
    if (paperScore <= 0 ) 
    {
        paperScore = 0
        gfx.RemoveSprite(rollButton) 
        rollButton.active = false
    }
}

function UpdatePastaScore()
{
    var scoreText = pastaScore.toString();
    pastaTxt.SetText( scoreText ) 
    UpdateImmune(-5);
}

function GameOver()
{
    gameOver=true;
    //gfx.AddSprite( black, 0, 0, 1, 1 )
    screens.Goto(1)
    gfx.AddSprite( screens, 0, 0, 1,1 )
    screens.Goto(1)
    //gfx.AddSprite( gameover, 0.1, 0.4, 0.8)
    gfx.AddSprite( replay, 0.2, 0.8, 0.6)
}


