var studentPromise = d3.json("classData.json")

studentPromise.then(
    function(students)
    {
        console.log(students);
        initGraph("#graph", students)
        
    },
    function(err)
    {
        console.log("didnt work");
    })
var initGraph = function(target,students)
{
    var padding = 10;
    var screen = {width:500, height:400}
    
    var margins = {top:15, bottom:40, left:70, right:40};
    
    var graph = 
    {
        width:screen.width-margins.left-margins.right,
        height:screen.height-margins.top-margins.bottom,
    }
    
    d3.select(target)
        .attr("width", screen.width)
        .attr("height", screen.height)
    
    var g = d3.select(target)
        .append("g")
        .classed("graph", true)
        .attr("transform", "translate("+margins.left+","+margins.top+")"); 
    
    var xScale = d3.scaleLinear()
        .domain([0, students[0].quizes.length-1])
        .range([padding, graph.width-padding])
    var highW = d3.max(students, function(student)
        {
            return d3.max(student.quizes.map(function(quiz){return quiz.grade}));
        })
    var yScale = d3.scaleLinear()
        .domain([0, highW])
        .range([graph.height-padding,padding])
    var color = d3.scaleLinear()
        .domain([0, highW])
        .range(["blue", "yellow"])
    createLabels(screen,margins,graph,target);
    createAxes(screen,margins,graph,target,xScale,yScale);
    createLegend(screen,margins,graph,
                 target,color)
    drawLines(students, graph,target,
              xScale,yScale, color);
    
    
}
var createLegend = function(screen,margins,graph,
                             target,color)
{
    
    var legend = d3.select(target)
        .append("g")
        .classed("legend",true)
        .attr("transform","translate("+
              (margins.left+ 10) +","+
             (margins.top+10)+")");
    
    var entries = legend.selectAll("g")
        .data(["Passing","Failing"])
        .enter()
        .append("g")
        .classed("legendEntry",true)
        .attr("fill",function(score)
             {
                if (score== "Passing"){return color(9)}
                else {return color(3)}
             })
        .attr("transform",function(score,index)
              {
                return "translate(0,"+index*20+")";
              })
        .on("click",function(score)
        {
            console.log(score)
            var on = ! d3.select(this).classed("off");
            if(on) //turn off
                {
                    d3.select(this)
                        .classed("off",true);
                    d3.selectAll("."+score)
                        .classed("off",true);
                }
            else
                {
                    d3.select(this)
                        .classed("off",false);        
                    d3.selectAll("."+score)
                        .classed("off",false);

                }
        })
            
        entries.append("rect")
                .attr("width",10)
                .attr("height",10)
    
        entries.append("text")
                .text(function(score){return score;})
                .attr("x",15)
                .attr("y",10)  
}

var createLabels = function(screen,margins,
graph,target)
{
        var labels = d3.select(target)
        .append("g")
        .classed("labels",true)
        
    labels.append("text")
        .text("Quiz Grades for Penguins")
        .classed("title",true)
        .attr("text-anchor","middle")
        .attr("x",margins.left+(graph.width/2))
        .attr("y",margins.top)
    
    labels.append("text")
        .text("Quiz Number")
        .classed("label",true)
        .attr("text-anchor","middle")
        .attr("x",margins.left+(graph.width/2))
        .attr("y",screen.height)
    
    labels.append("g")
        .attr("transform","translate(20,"+ 
              (margins.top+(graph.height/2))+")")
        .append("text")
        .text("Quiz Score")
        .classed("label",true)
        .attr("text-anchor","middle")
        .attr("transform","rotate(90)")
    
}


var createAxes = function(screen,margins,graph,
                           target,xScale,yScale)
{
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    
    var axes = d3.select(target)
        .append("g")
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top+graph.height)+")")
        .call(xAxis)
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top)+")")
        .call(yAxis)
}   

var drawLines = function(students,graph,target,
              xScale,yScale, color)
{
    
    var lineGenerator = d3.line()
        .x(function(quizGrade,i) { return xScale(i);})
        .y(function(quizGrade)   { return yScale(quizGrade);})
    
    
    var lines = d3.select(target)
        .select(".graph")
        .selectAll("g")
        .data(students)
        .enter()
        .append("g")
        .attr("class", function(student)
        {
            var mean = d3.mean(student.quizes.map(function(quiz){return quiz.grade}));
            if(mean < 6){return "passing"}
            else{return "failing"}
        })
        .classed("line",true)
        .attr("fill","none")
        .attr("stroke",function(student) 
        { 
            return color(d3.mean(student.quizes,function (quizes){return quizes.grade}));
        });
        lines.on("mouseover",function(student)
        {   
            if(! d3.select(this).classed("off"))
            {
                d3.selectAll(".line")
                    .classed("fade",true);

                d3.select(this)
                    .classed("fade",false)
                    .raise(); //move to top
            }
        })
        .on("mouseout",function(student)
        {
            if(! d3.select(this).classed("off"))
            {
                d3.selectAll(".line")
                .classed("fade",false);
            }
        })
    
    lines.append("path")
        .datum(function(student) 
            { return student.quizes.map(function(quizes){return quizes.grade});})
        .attr("d",lineGenerator); 
    
}