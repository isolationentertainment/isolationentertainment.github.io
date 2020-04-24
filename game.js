
/*
  Viral Defence

  By Seb Walker <isolationentertainment20@gmail.com>
  
  Built using DroidScript GameView:-   
  
  <http://droidscript.org/>  
  <https://dsgameview.wixsite.com/gameview/>
 
  Graphics By Seb Walker 

  Music Credit:

	8bit Dungeon Boss - Video Classica by Kevin MacLeod is licensed under a Creative Commons Attribution license (https://creativecommons.org/licenses/by/4.0/)
	Source: http://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200067
	Artist: http://incompetech.com/

	8bit Dungeon Level - Video Classica by Kevin MacLeod is licensed under a Creative Commons Attribution license (https://creativecommons.org/licenses/by/4.0/)
	Source: http://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200066
	Artist: http://incompetech.com/

	{8_bit_March} by Twin Musicom (twinmusicom.org)
	{Digital Voyage} by Twin Musicom (twinmusicom.org)
	{Mega Rust} by Twin Musicom (twinmusicom.org)
	{NES Boss} by Twin Musicom (twinmusicom.org)

*/


_isWebView = true; //Hack to fix bug in older version of gameview

var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

//Include other scripts.
gfx.Script("animation.js");
gfx.Script("sprites.js");
gfx.Script("levels.js");
gfx.Script("storm.js");

//Global variables
var gameOver = false
var paused = true
var gravity = 10
var score = "000000000"
var paperScore = 0
var pastaScore = 0
var viruses = []
var drops = [];
var rolls = [];
var dropFired = false;
var handSanDestroyed = false
var difficulty = 1;
var masked = false;
var ready = false;
var bossFight = false;
var bossNo = 1;
var hitCounter = 0;
var nextCol;

var maskFreq = 30000
var pastaFreq = 20000
var paperFreq = 20000


//if on pc ======================
var bossSpeed = 0.00005
var virusSpeed = 0.002
var virusFreq = 280
var virusPoints = 100
var fireRate = 50
var animationSpeed = 0.5
//===============================


var xDir = 1
var updated = true
var levelUpdated = false
var level = 0
var currLevel = 0
var scoreCounter = 0
var immuneSys = 100

var storm = false

//Handle game loading.
function OnLoad()
{
	//Adjust speeds for phones as lower performance
	if(isMobile) 
	{
		bossSpeed = 0.0002
		virusSpeed = 0.005
		virusFreq = 280
		virusPoints = 100
		fireRate = 50
		animationSpeed = 1
	}
	
    //Create text objects.
	score = gfx.CreateText( score.toString(), 0.04, "Img/Pixeboy.xml" )
	immune = gfx.CreateText( immuneSys.toString() + "%", 0.03, "Img/Pixeboy.xml" )
	heart = gfx.CreateSprite("Img/heart.png" )
	pastaTxt = gfx.CreateText( pastaScore.toString() , 0.03, "Img/Pixeboy.xml" )
	paperTxt = gfx.CreateText( paperScore.toString() , 0.03, "Img/Pixeboy.xml" )
	finalScoreTxt = gfx.CreateText( "SCORE" , 0.03, "Img/Pixeboy.xml" )
    
    //Create animated sprites.
    face = gfx.CreateSprite( "Img/face_2898x2090x3x11" )
	replay = gfx.CreateSprite( "Img/replay.png" )
    screens = gfx.CreateSprite( "Img/screens_2520x3360x4x3")   
	handSan = gfx.CreateSprite( "Img/pure_1440x1800x4x5", "handSans" )
    
    drop = gfx.CreateSprite( "Img/drop_384x512x3x4", "drops" )
	virus = gfx.CreateSprite( "Img/corona_256x512x1x2", "viruses" )
	paper = gfx.CreateSprite("Img/paper_1024x1024x4x2", "g_papers" )
    
	mask = gfx.CreateSprite("Img/mask_492x536x3x4", "masks" )
	paperIcon = gfx.CreateSprite("Img/paperIcon.png")
	pasta = gfx.CreateSprite("Img/pasta_560x560x2x2", "pastas" )
	pastaIcon = gfx.CreateSprite("Img/pasta_560x560x2x2", "pastas" )
    
    boss = gfx.CreateSprite("Img/boss_2688x2700x7x6", "boss" )
    
    //Load 'virus storm' assets.
    StormLoad()
    
    rollButton = gfx.CreateSprite("Img/paperIcon.png")
    roll = gfx.CreateSprite( "Img/paper_1024x1024x4x2" )
    
    //Create sounds.
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
    //Add delay to allow music to fully load
    setTimeout(AddAssets, 500)   
}

//Called when game has loaded.
function AddAssets()
{
	//Add static background sprites
	backColor = gfx.CreateRectangle(1, 1, 0xfffdad )
	gfx.AddGraphic( backColor, 0 , 0 )
	gfx.AddSprite( face, 0, 0.886, 1 )
	gfx.AddSprite( pasta, 0.85, 0.08, 0.1 )
	gfx.AddSprite( pastaIcon, 0.85, 0.08, 0.1 )
	gfx.AddSprite( paperIcon, 0.86, 0.15, 0.08 )
    
    //Add counters.
	gfx.AddText( pastaTxt, 0.8, 0.09 );
	gfx.AddText( paperTxt, 0.8, 0.15 );
    
    //Add scores
	gfx.AddText( score, 0.012, 0.01 );
	gfx.AddText( immune, 0.68, 0.02 );
	gfx.AddSprite( heart, 0.86, 0.02, 0.08 )
	
	//Add game objects to screen.
	AddHandSan()
    
    //Create a batch containers for our virus and drop sprites.
    //(gives higher performance for lots of same sprite/particle)
    batchVirus = gfx.CreateBatch()
    gfx.AddBatch( batchVirus )
    batchDrops = gfx.CreateBatch()
    gfx.AddBatch( batchDrops )
    
    //Hack to provide missing funcs in GameView.
    batchVirus.RemoveSprite = function( sprite ) { batchVirus.removeChild( sprite.sprite ); sprite.added = false; }
    batchDrops.RemoveSprite = function( sprite ) { batchDrops.removeChild( sprite.sprite ); sprite.added = false; }
    
	//Show splash screen.
    gfx.AddSprite( screens, 0, 0, 1,1 )
    
    
    //Start game.
    gfx.Play()
    

	screens.PlayRange(2,8,0.08*animationSpeed,false)
	setTimeout(function(){screens.Goto(0); ready=true},2500)
}

function StartGame()
{
    paused = false
    gfx.RemoveSprite(screens)
    
    setTimeout(AddVirus, virusFreq)
    
    StartPickups()
	
	setTimeout(Cough, 10000 + Math.random()*10000)
	setInterval(Blink, 2000 + 2000*Math.random())
	//setInterval(Cough, 2000 + 2000*Math.random())
	music1.Play(true)
	
	//AddRollButton()
	//UpdateScore(29000); bossNo = 1; //jump to boss 1
	//UpdateScore(69000); bossNo = 2;  //jump to boss 2
	//UpdateScore(110000);  bossNo = 3; //jump to boss 3
}

function StartPickups()
{
    setTimeout(AddPaper, paperFreq + Math.random()*paperFreq)
    setTimeout(AddPasta, pastaFreq + Math.random()*pastaFreq)
    setTimeout(AddMask, maskFreq + Math.random()*maskFreq)
}


//Handle key presses and screen touches.
function OnControl( touchState, touchX, touchY, keyState, key )
{
    if (rollButton.Contains(touchX,touchY) && touchState=="Down" && rollButton.active == true) FireRoll();
    
	if(!gameOver && !paused && touchState && !rollButton.Contains(touchX,touchY))
	{
    	if(touchState == "Down" ) 
    	{
    	    handSan.Play(0, 0.9*animationSpeed)
	        handSan.StopAt(10)
	        open.Play()
    	}

    	else if(touchState == "Move" ) 
    	{
    	    handSan.x = touchX-0.2
    	}
    	else if(touchState == "Up" ) 
    	{
    	    handSan.Play(12, 0.9)
	        handSan.StopAt(20)
	        close.Play()
    	}
		if( !dropFired )
		{
		    dropFired = true;
		    //handSan.PlayRange(6,12,0.9)
		    handSan.Play(6, 0.9*animationSpeed)
	        handSan.StopAt(12)
	        //sqrt2.Play()
	        //var pick = Math.random()
            //if ( pick >= 0.5 ) sqrt.Play()
            //else 
            sqrt.Play()
	        setTimeout(FireDrop, 50)
		}
	}
	
	
	else if (paused)
	{
	   if(touchState && touchY>=0.6 && ready) 
    	{
    	    StartGame()
    	}
	}
	
	else if( gameOver && replay.Contains(touchX,touchY) && touchState=="Down" ) 
	{ 
          ready = false;
          gfx.Reload();
	}	
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
    immune.SetText( scoreText + "%" ) 
    
    if(immuneSys <= 0) 
    {
        
        StormStart()
        //GameOver()
    }
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
    
    gfx.AddText( finalScoreTxt, 0.1, 0.71 )
    var scr = scoreCounter.toString();
    finalScoreTxt.SetText("Score: " + scr)
}


