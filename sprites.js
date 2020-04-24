/*
  Viral Defence

  Authored By Seb Walker <isolationentertainment20@gmail.com>
  Built using DroidScript <http://droidscript.org/>

*/


function AddHandSan()
{
    handSan = gfx.CreateSprite( "Img/pure_1440x1800x4x5" )
    gfx.AddSprite( handSan, 0.27, 0.65 )
}

function AddVirus()
{
	virus = gfx.CreateSprite( "Img/corona_256x512x1x2", "viruses" )
	virus = gfx.CreateSprite( "Img/corona_256x512x1x2", "viruses" )
	var size = 0.1+0.1*Math.random()
    
	//virus.x = virus.y = 0
	virus.x = Math.random() * (0.85 - 0.02) + 0.02;
	virus.active = true
	
	
	viruses.push(virus)
	
	//gfx.AddSprite( virus, null, -0.1, size )
    batchVirus.AddSprite( virus, null, -0.1, size )
	
	virus.Play( 0, 0.01*animationSpeed )
	if(!bossFight) setTimeout(AddVirus, virusFreq-(difficulty*10))  /////DIFFICULTY NUMBER DROPPING
}

function AddRollButton()
{
    var size = 0.14
    rollButton = gfx.CreateSprite("Img/paperIcon.png")
    rollButton.alpha = 0.5
    gfx.AddSprite( rollButton, 0.82, 0.85, size )
    rollButton.active = true
}


function AddBoss()
{
    var size = 0.3 + (0.1 * bossNo)
    boss = gfx.CreateSprite("Img/boss_2688x2700x7x6", "boss" )
    gfx.AddSprite( boss, 0.28, -0.3, size )
    boss.PlayRange( 0,1, 0.01*animationSpeed )
}


function AddPaper()
{
	if(paper.active) return
	paper = gfx.CreateSprite("Img/paper_1024x1024x4x2", "g_papers" )
	var size = 0.2
    
	//virus.x = virus.y = 0
	paper.x = Math.random() * (0.85 - 0.02) + 0.02;
	paper.active = true
	//papers.push(paper)
	
	gfx.AddSprite( paper, null, -0.3, size )
	
	paper.PlayRange( 0,6, 0.5*animationSpeed )
	if(!bossFight) setTimeout(AddPaper, paperFreq + (difficulty*1000) + Math.random()*paperFreq)
}


function AddPasta()
{
	if(pasta.active) return

	pasta = gfx.CreateSprite("Img/pasta_560x560x2x2", "pastas" )
	var size = 0.2
    
	//virus.x = virus.y = 0
	pasta.x = Math.random() * (0.85 - 0.02) + 0.02;
	pasta.active = true
	
	gfx.AddSprite( pasta, null, -0.3, size )
	
	pasta.PlayRange( 0,4, 0.4*animationSpeed )
	if(!bossFight) setTimeout(AddPasta, pastaFreq + (difficulty*1000) + Math.random()*pastaFreq)
}


function AddMask()
{
	if(mask.active) return

	mask = gfx.CreateSprite("Img/mask_492x536x3x4", "masks" )
	var size = 0.2
    
	//virus.x = virus.y = 0
	mask.x = Math.random() * (0.85 - 0.02) + 0.02;
	mask.active = true
	
	gfx.AddSprite( mask, null, -0.3, size )
	
	mask.PlayRange( 0,8, 0.4*animationSpeed )
	if(!bossFight) setTimeout(AddMask, maskFreq + (difficulty*1000) + Math.random()*pastaFreq)
}


//Fire a drop from handSan
function FireDrop()
{
	drop = gfx.CreateSprite( "Img/drop_384x512x3x4", "drops" )
	
    //Show drop.
	drop.x = handSan.x + handSan.width/2.75 - drop.width/2
	drop.active = true
	drops.push(drop)
	//gfx.AddSprite( drop, null, 0.68, 0.1)
    batchDrops.AddSprite( drop, null, 0.68, 0.1)
    
	//Start drop animation and set its speed.
	drop.Play( 0, 0.2*animationSpeed )
	
	//Play firing sound.
	setTimeout(ResetFired, 100)
}

function FireRoll()
{
    roll = gfx.CreateSprite( "Img/paper_1024x1024x4x2" )
    
    //Show roll.
	roll.x = handSan.x + handSan.width/2.75 - roll.width/2
	roll.active = true
	rolls.push(roll)
	roll.angle = 0.5;
	gfx.AddSprite( roll, null, 0.68, 0.2)
    
	//Start roll animation and set its speed.
	roll.PlayRange( 0,6, 0.5*animationSpeed )
    UpdatePaperScore(-1);
}
