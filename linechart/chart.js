const data = [{
    date: '2020-01-01',
    attacks: 0,
    blocked: 0
}, {
    date: '2020-01-15',
    attacks: 10,
    blocked: 5
}, {
    date: '2020-02-01',
    attacks: 25,
    blocked: 20
}, {
    date: '2020-02-15',
    attacks: 40,
    blocked: 20,
}, {
    date: '2020-03-01',
    attacks: 80,
    blocked: 130
}, {
    date: '2020-03-15',
    attacks: 100,
    blocked: 120
}, {
    date: '2020-04-01',
    attacks: 60,
    blocked: 10
}, {
    date: '2020-04-15',
    attacks: 50,
    blocked: 0
}, {
    date: '2020-05-01',
    attacks: 38,
    blocked: 35
}, {
    date: '2020-05-15',
    attacks: 60,
    blocked: 15
}, {
    date: '2020-06-01',
    attacks: 140,
    blocked: 65
}, {
    date: '2020-06-15',
    attacks: 120,
    blocked: 100
}, {
    date: '2020-07-01',
    attacks: 45,
    blocked: 10
}, {
    date: '2020-07-15',
    attacks: 80,
    blocked: 20
}, {
    date: '2020-08-01',
    attacks: 20,
    blocked: 0
}, {
    date: '2020-08-15',
    attacks: 0,
    blocked: 0
}]
    

async function drawLineChart(dataset) { 
    const attacksAccessor = d => d.attacks
    const blockedAccessor = d => d.blocked
    const biggerAccessor = d => d.attacks > d.blocked ? d.attacks : d.blocked
    const dateParser = d3.timeParse("%Y-%m-%d") 
    const xAccessor = d => dateParser(d.date)


    let dimensions = {
        width: window.innerWidth * 0.95, 
        height: 400,
        margin: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60,
        }, 
    }
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom


    const wrapper = d3.select("#wrapper") 
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounds = wrapper.append("g") 
        .style("transform", `translate(${
            dimensions.margin.left
        }px, ${ 
            dimensions.margin.top
        }px)`)


    const yScale = d3.scaleLinear() 
        .domain(d3.extent(dataset, biggerAccessor))
        .range([dimensions.boundedHeight, 0])
    const xScale = d3.scaleTime() 
        .domain(d3.extent(dataset, xAccessor)) 
        .range([0, dimensions.boundedWidth])

    function make_y_gridlines() {		
        return d3.axisLeft(yScale)
            .ticks(5)
    }

    bounds.append("g")			
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-dimensions.boundedWidth)
            .tickFormat("")
        )

    const area1 = d3.area()
        .x(d => xScale(xAccessor(d)))
        .y0(dimensions.height)
        .y1(d => yScale(attacksAccessor(d)))

    const area2 = d3.area()
        .x(d => xScale(xAccessor(d)))
        .y0(dimensions.height)
        .y1(d => yScale(blockedAccessor(d)))

    bounds.append("linearGradient")				
        .attr("id", "area-gradient1")			
        .attr("gradientUnits", "userSpaceOnUse")	
        .attr("x1", 0).attr("y1", yScale(0))			
        .attr("x2", 0).attr("y2", yScale(100))		
        .selectAll("stop")						
            .data([								
                {offset: "0%", color: "#d46c6a", opacity: 0},		
                {offset: "100%", color: "#d46c6a", opacity: 0.6}	
            ])					
        .enter().append("stop")			
            .attr("offset", function(d) { return d.offset; })	
            .attr("stop-color", function(d) { return d.color; })
            .attr("stop-opacity", function(d) { return d.opacity; })

    bounds.append("linearGradient")				
        .attr("id", "area-gradient2")			
        .attr("gradientUnits", "userSpaceOnUse")	
        .attr("x1", 0).attr("y1", yScale(0))			
        .attr("x2", 0).attr("y2", yScale(100))		
        .selectAll("stop")						
            .data([								
                {offset: "0%", color: "#bace3d", opacity: 0},		
                {offset: "100%", color: "#bace3d", opacity: 0.6}	
            ])					
        .enter().append("stop")			
            .attr("offset", function(d) { return d.offset; })	
            .attr("stop-color", function(d) { return d.color; })
            .attr("stop-opacity", function(d) { return d.opacity; })


    const lineGenerator1 = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(attacksAccessor(d)))
    const lineGenerator2 = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(attacksAccessor(d)))

    const line1 = bounds.append("path")
        .datum(dataset)
        .attr("d", lineGenerator1(dataset))
        .attr("class", "area")
        .attr("d", area1)
        .style("fill", "url(#area-gradient1)");

    const line2 = bounds.append("path")
        .datum(dataset)
        .attr("d", lineGenerator2(dataset))
        .attr("class", "area")
        .attr("d", area2)
        .style("fill", "url(#area-gradient2)");

    const yAxisGenerator = d3.axisLeft().scale(yScale)
    const xAxisGenerator = d3.axisBottom().scale(xScale)
    const yAxis = bounds.append("g")
        .attr("class", "axis")
        .call(yAxisGenerator)
    const xAxis = bounds.append("g") 
        .call(xAxisGenerator)
        .attr("class", "axis")
        .style("transform", `translateY(${
             dimensions.boundedHeight
        }px)`)

    const listeningRect = bounds.append("rect")
        .attr("class", "listening-rect") 
        .attr("width", dimensions.boundedWidth) 
        .attr("height", dimensions.boundedHeight) 
        .on("mousemove", onMouseMove) 
        .on("mouseleave", onMouseLeave)

    const tooltipAttacks = d3.select("#tooltipAttacks")
    const tooltipBlocked = d3.select("#tooltipBlocked")
    const tooltipCircle1 = bounds.append("circle")
      .attr("class", "tooltip-circle")
      .attr("r", 4)
      .attr("stroke", "#F3F5F6")
      .attr("fill", "#1D293F")
      .attr("stroke-width", 2)
      .style("opacity", 0)
    const tooltipCircle2 = bounds.append("circle")
      .attr("class", "tooltip-circle")
      .attr("r", 4)
      .attr("stroke", "#F3F5F6")
      .attr("fill", "#1D293F")
      .attr("stroke-width", 2)
      .style("opacity", 0)
    function onMouseMove() {
        const mousePosition = d3.mouse(this)
        const hoveredDate = xScale.invert(mousePosition[0])
    
        const getDistanceFromHoveredDate = d => Math.abs(xAccessor(d) - hoveredDate)
        const closestIndex = d3.scan(dataset, (a, b) => (
          getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
        ))
        const closestDataPoint = dataset[closestIndex]
    
        const closestXValue = xAccessor(closestDataPoint)
        const closestAttacksValue = attacksAccessor(closestDataPoint)
        const closestBlockedValue = blockedAccessor(closestDataPoint)
    
        const x = xScale(closestXValue)
          + dimensions.margin.left + 8
        const yAttacks = yScale(closestAttacksValue)
          + dimensions.margin.top + 10
        const yBlocked = yScale(closestBlockedValue)
          + dimensions.margin.top + 10
    
        tooltipAttacks.style("transform", `translate(`
          + `calc( -50% + ${x}px),`
          + `calc(-100% + ${yAttacks}px)`
          + `)`)
        tooltipBlocked.style("transform", `translate(`
          + `calc( -50% + ${x}px),`
          + `calc(-100% + ${yBlocked}px)`
          + `)`)
    
        tooltipAttacks.style("opacity", 1)
        tooltipBlocked.style("opacity", 1)

        tooltipAttacks.select("#countAttacks")
            .html(closestAttacksValue)
        tooltipBlocked.select("#countBlocked")
            .html(closestBlockedValue)
        tooltipCircle1
            .attr("cx", xScale(closestXValue))
            .attr("cy", yScale(closestAttacksValue))
            .style("opacity", 1)
        tooltipCircle2
            .attr("cx", xScale(closestXValue))
            .attr("cy", yScale(closestBlockedValue))
            .style("opacity", 1)
      }
    
      function onMouseLeave() {
        tooltipAttacks.style("opacity", 0)
        tooltipBlocked.style("opacity", 0)
    
        tooltipCircle1.style("opacity", 0)
        tooltipCircle2.style("opacity", 0)
      }

}

drawLineChart(data)

var resizeTimer;
window.onresize = function(event) {
 clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    var s = d3.selectAll('svg');
    s = s.remove();
    drawLineChart(data)
  }, 10);
}
