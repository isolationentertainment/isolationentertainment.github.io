function BossBattle()
{
    hitCounter = 0;
    bossFight = true;
    setTimeout(AddBoss,3000)
}

function UpdateScore(points)
{
    scoreCounter += points;
    
    if(scoreCounter >= 10000 && scoreCounter < 20000) level = 2
    else if(scoreCounter >= 20000 && scoreCounter < 30000) level = 3
    else if(scoreCounter >= 30000 && scoreCounter < 40000) level = 4
    else if(scoreCounter >= 40000 && scoreCounter < 50000) level = 5
    else if(scoreCounter >= 50000 && scoreCounter < 60000) level = 6
    else if(scoreCounter >= 60000 && scoreCounter < 70000) level = 7
    else if(scoreCounter >= 70000 && scoreCounter < 80000) level = 8
    else if(scoreCounter >= 80000 && scoreCounter < 90000) level = 9
    else if(scoreCounter >= 90000 && scoreCounter < 100000) level = 10
    else if(scoreCounter >= 100000 && scoreCounter < 1000000) level = 11
    
    if(level > currLevel)
    {
        UpdateLevel(level)
    }
    
    // Format the score text with leading zeros
    var scoreText = scoreCounter.toString();
    while(scoreText.length < 9)
    {
        scoreText = "0" + scoreText;
    }
    score.SetText( scoreText ) 
}

function UpdateLevel(level)
{
        difficulty++;
        currLevel = level
        
        if(level == 2) 
        {
            BossBattle();
            music1.Pause(); 
            setTimeout(function(){music4.Play(true)},100)
        }
        else if(level == 3) 
        {
            var color = 0xa5ff89
            UpdateBackground(color);
        }
        else if(level == 4) 
        {
            var color = 0x5cdfd4
            UpdateBackground(color); 
        }
        else if(level == 5)  
        {
            var color = 0x4460cc
            UpdateBackground(color); 
        }
        else if(level == 6)  
        {
            BossBattle(); 
            music2.Pause(); 
            setTimeout(function(){music3.Play(true)},100) 
        }
        else if(level == 7) 
        {
            var color = 0xa924dd
            UpdateBackground(color); 
        }
        else if(level == 8)
        {
            var color = 0x206b02
            UpdateBackground(color); 
        }
        else if(level == 9) 
        {
            var color = 0x615600
            UpdateBackground(color); 
        }
        else if(level == 10) 
        {
            BossBattle(); 
            music2.Pause(); 
            setTimeout(function(){music4.Play(true)},100) 
        }
        else if(level == 11) 
        {
            var color = 0x383838
            UpdateBackground(color); 
        }
}

function UpdateBackground(col)
{
    gfx.RemoveGraphic(backColor);
    backColor = gfx.CreateRectangle(1, 1, col )
    gfx.AddGraphic( backColor, 0 , 0 )
    gfx.SetOrder(backColor, -1)
}