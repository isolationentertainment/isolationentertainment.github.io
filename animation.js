//Update game objects.
//(called for every frame)
function OnAnimate( time, timeDiff ) 
{
	//Do nothing if game is over.
	if( gameOver || paused ) return
	
	
    TestForCollisions()
    UpdateDrops()
    UpdateRoll()
    TestForPickups()
    UpdateEnemies()
    UpdatePickups()
	
}

function Blink()
{
    if(!masked)
    {
        face.Goto(0)
        face.PlayRange(0,15,0.5, false)
    }
}

function Cough()
{
    if(!masked)
    {
        face.Goto(0)
        face.PlayRange(15,31,0.3, false)
        var pick = Math.random()
        if ( pick >= 0.5 ) cough.Play()
        else cough2.Play()
    }
    setTimeout(Cough, 10000 + Math.random()*10000)
}

function Mask(mask)
{
    if(mask) 
    {
        masked = true
        face.Goto(32)
        setTimeout(function(){Mask(false)}, 10000)
    }
    else 
    {
        masked = false
        face.Goto(0)
    }
}

// Update the positions of the enemy ships
function UpdateEnemies()
{
    
    for (var i = 0; i < viruses.length; i++) 
	{
		if(viruses[i].active)
        {
            if(!viruses[i].stuck)
            {
                var virus = viruses[i]
    		    virus.y += 0.003 + (difficulty*0.0005)
            }
        }
        else
        {
            // If the enemy is no longer active (destroyed or
            gfx.RemoveSprite(viruses[i]);
            viruses.splice(i, 1);
        }
	}
	
    if (bossFight) 
    {
        if(boss.y < 0 ) boss.y += 0.001
        if (boss.y > 0.6 ) GameOver()
        else
        {
            boss.x += xDir * 0.001
            if( bossNo == 1 ) boss.y += (0.0002)
            else if ( bossNo == 2 ) boss.y += (0.0003)
            else boss.y += (0.0004)
            if (boss.x > 0.5) xDir = -1
            if (boss.x < 0) xDir = 1
        }
    }
}

// Update the positions of the enemy ships
function UpdatePickups()
{

		if(paper.active && paper.y < 1.3)
        {
		    paper.y += 0.003 + (difficulty*0.0005)
        }
        else
        {
            // If the enemy is no longer active (destroyed or
            gfx.RemoveSprite(paper);             
        }
    

		if(pasta.active && pasta.y < 1.3)
        {
		    pasta.y += 0.003 + (difficulty*0.0005)
        }
        else
        {
            // If the enemy is no longer active (destroyed or
            gfx.RemoveSprite(pasta);
            
        }


		if(mask.active && mask.y < 1.3)
        {
		    mask.y += 0.003 + (difficulty*0.0005)
        }
        else
        {
            // If the enemy is no longer active (destroyed or
            gfx.RemoveSprite(mask);
            
        }

}

// Update the positions of all the active bullets
function UpdateDrops()
{
    if (drops.length)
    {
        for(var i = 0; i < drops.length; i++)
        {
            if(drops[i].active && drops[i].y > 0)
            {   
                var drop = drops[i]
    		    drop.y -=0.02
            }
            else
            {
                // If the enemy is no longer active
                gfx.RemoveSprite(drops[i]);
                drops.splice(i, 1);
            }
        }
    }
}

// Update the positions of all the active bullets
function UpdateRoll()
{
    if (rolls.length)
    {
        for(var i = 0; i < rolls.length; i++)
        {
            if(rolls[i].active && rolls[i].y > 0)
            {   
                rolls[i].y -=0.01
            }
            else
            {
                // If the enemy is no longer active
                gfx.RemoveSprite(rolls[i]);
                rolls.splice(i, 1);
            }
        }
    }
}


function TestForCollisions()
{
    if (viruses.length)
    {
        // Loop through all our enemy objects
        for(var i = 0; i < viruses.length; i++)
        {
            if(viruses[i].active && viruses[i].y > 0)
            {
                
                // Loop through all active drops
                for(var b = 0; b < drops.length; b++)
                {
                    if(drops[b].active)
                    {
                        // Check if the bullet hit the enemy
                        if(gfx.IsOverlap(viruses[i],drops[b], 0.03))
                        {

                            // Increase the score counter for destroying this enemy
                            UpdateScore(100);
                            pop.Play()

                            // Bullet is no longer active after a successful hit
                            drops[b].active = false;
                            viruses[i].active = false
                        }
                    }
                }
                // Loop through all active drops
                for(var b = 0; b < rolls.length; b++)
                {
                    if (rolls[b].active)
                    {
                        // Check if the roll  hit the enemy
                        if(gfx.IsOverlap(viruses[i],rolls[b], 0.03))
                        {
                            UpdateScore(100);
                            pop.Play()
                            viruses[i].active = false
                        }
                    }
                }
                
                // Check if the bullet hit the enemy
                if(gfx.IsOverlap(viruses[i],face, 0.08) && !masked)
                {
                    if(!viruses[i].stuck)
                    {
                        // Increase the score counter for destroying this enemy
                        UpdateImmune(10);
                    }
                    viruses[i].stuck = true;
                    // Bullet is no longer active after a successful hit
                    //viruses[i].active = false
                }
    
            }
        }
    }
    
    if(bossFight && boss.y > -0.2)
    {
        // Loop through all active drops
        for(var b = 0; b < drops.length; b++)
        {
            if(drops[b].active)
            {
                // Check if the bullet hit the enemy
                if(gfx.IsOverlap(boss,drops[b], 0.03))
                {
                    // Bullet is no longer active after a successful hit
                    bossHitSnd.Play()
                    drops[b].active = false;
                    hitCounter++;
                    updated = false;
                }
            }
        }
        // Loop through all active drops
        for(var b = 0; b < rolls.length; b++)
        {
            if (rolls[b].active)
            {
                // Check if the roll  hit the enemy
                if(gfx.IsOverlap(boss,rolls[b], 0.03))
                {
                    tpHitSnd.Play()
                    rolls[b].active = false
                    
                    if(bossNo == 1) hitCounter += 20;
                    else if(bossNo == 2) hitCounter += 10;
                    else if(bossNo == 3) hitCounter += 8;
                    updated = false;
                }
            }
        }
        if (!updated)
        {
            if (hitCounter >= 10 && hitCounter < 20) {boss.PlayRange( 2,3, 0.01 ); updated = true;}
            else if (hitCounter >= 20 && hitCounter < 30) {boss.PlayRange( 4,5, 0.01 ); updated = true;}
            else if (hitCounter >= 30 && hitCounter < 40) {boss.PlayRange( 6,7, 0.01 ); updated = true;}
            else if (hitCounter >= 40 && hitCounter < 50) {boss.PlayRange( 8,9, 0.01 ); updated = true;}
            else if (hitCounter >= 50 && hitCounter < 60) {boss.PlayRange( 10,11, 0.01 ); updated = true;}
            else if (hitCounter >= 60 && hitCounter < 70) {boss.PlayRange( 12,13, 0.01 ); updated = true;}
            else if (hitCounter >= 70 && hitCounter < 80) {boss.PlayRange( 14,15, 0.01 ); updated = true;}
            else if (hitCounter >= 80 && hitCounter < 90) {boss.PlayRange( 16,17, 0.01 ); updated = true;}
            else if (hitCounter >= 90 && hitCounter < 100) {boss.PlayRange( 18,19, 0.01 ); updated = true;}
            else if (hitCounter >= 100 && hitCounter < 110) {boss.PlayRange( 20,21, 0.01 ); updated = true;}
            else if (hitCounter >= 110 && hitCounter < 120) {boss.PlayRange( 22,23, 0.01 ); updated = true;}
            else if (hitCounter >= 120 && hitCounter < 130) {boss.PlayRange( 24,25, 0.01 ); updated = true;}
            else if (hitCounter >= 130 && hitCounter < 140) {boss.PlayRange( 26,27, 0.01 ); updated = true;}
            else if (hitCounter >= 140 )                    
            {
                bossFight = false
                hitCounter = 0;
                
                if (bossNo == 1) var color = 0xfff317
                else if (bossNo == 2) var color = 0x3fd9ca
                else if (bossNo == 3) var color = 0x3d0c45
                bossNo++;
                boss.PlayRange( 28,35, 0.05, false )
                bossDieSound.Play()
                setTimeout(function(){
                    gfx.RemoveSprite( boss )
                    boss.x = -1
                    music4.Pause(); 
                    music3.Pause(); 
                    setTimeout(function(){music2.Play(true)},100)

                    UpdateBackground(color);
                    setTimeout(AddRock, virusFreq)
                	setTimeout(AddPaper, paperFreq + (difficulty*1000) + Math.random()*paperFreq)
                	setTimeout(AddPasta, pastaFreq + (difficulty*1000) + Math.random()*pastaFreq)
                	setTimeout(AddMask, maskFreq + (difficulty*1000) + Math.random()*pastaFreq)
                },3000)
                updated = true;
            }
        }
    }
    
}

function TestForPickups()
{
    

        if(paper.active && !shipDestroyed)
        {
            if(gfx.IsOverlap(ship,paper, 0.1))
            {
                paper.active = false;
                UpdatePaperScore(1);
                UpdateScore(100);
                tpSound.Play()
            }
        }



        if(pasta.active && !shipDestroyed)
        {
            if(gfx.IsOverlap(ship,pasta, 0.1))
            {
                pasta.active = false;
                pastaScore++
                UpdatePastaScore();
                UpdateScore(100);
                pastaSound.Play()
            }
        }

    

        if(mask.active && !shipDestroyed)
        {
            if(gfx.IsOverlap(ship,mask, 0.1))
            {
                mask.active = false;
                Mask(true);
                maskSound.Play()
            }
        }

}
