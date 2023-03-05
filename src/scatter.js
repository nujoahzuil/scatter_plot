async function drawScatter() {

    // 1. Access data
  
    const dataset = await d3.json("./data/my_weather_data.json")
  
    // set data constants
  
    // Get data attributes, i.e. xAccesstor for max temperature and yAccessor for min temperature 
    // To DO
    const xAccessor = d => d.temperatureMin;
    const yAccessor = d => d.temperatureMax;
  
    const colorScaleYear = 2018;
    const parseDate = d3.timeParse("%Y-%m-%d");
    const formatMonth = d3.timeFormat("%B");
    const formatDay = d3.timeFormat("%d");
    const formatWeek = d3.timeFormat("%A");
    const formatMonthDay = d3.timeFormat("%b %d");
    const colorAccessor = d => formatMonth(parseDate(d.date).setYear(colorScaleYear));
  
    // Create chart dimensions
  
    const width = d3.min([
      window.innerWidth * 0.75,
      window.innerHeight * 0.75,
    ])
    let dimensions = {
      width: width,
      height: width,
      margin: {
        top: 90,
        right: 90,
        bottom: 50,
        left: 50,
      },
      legendWidth: 250,
      legendHeight: 26,
    }
    dimensions.boundedWidth = dimensions.width
      - dimensions.margin.left//50
      - dimensions.margin.right//90
    dimensions.boundedHeight = dimensions.height
      - dimensions.margin.top//90
      - dimensions.margin.bottom//50
  
    // Draw 
  
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
  
    const boundsBackground = bounds.append("rect")
        .attr("class", "bounds-background")
        .attr("x", 0)
        .attr("width", dimensions.boundedWidth)
        .attr("y", 0)
        .attr("height", dimensions.boundedHeight)
  
    // Create scales
  
    // Create scales for x, y, and color (i.e., xScale, yScale, and colorScale)
  
    // To DO
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([ 0,  dimensions.boundedWidth]);
  
    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([dimensions.boundedHeight, 0]);

    var colors = [];
    for (i = 0; i < 12; i++) {
      colors.push(d3.interpolateRainbow(-(2*i+1)/24));
    }

    const colorScale = d3.scaleOrdinal()
      .domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
      .range(colors);
    // 5. Draw data 
  
    // draw data into a scatter plot
  
    // To DO
    let dotsGroup = wrapper.append('g');

    //scatter plot
    let test2 = dotsGroup.selectAll("dot")
      .data(dataset)
      .join("circle")
    test2
        .attr("cx", function (d) { return xScale(xAccessor(d))+50; } )
        .attr("cy", function (d) { return yScale(yAccessor(d))+90; } )
        .attr("r", 5)
        .style("fill", function (d) { return colorScale(colorAccessor(d)); } )
  
    // Draw margin
  
    var x1 = d3.scaleLinear()
    .domain([0, 100])
    .range([0, dimensions.boundedWidth]);
  
    var y1 = d3.scaleLinear()
    .domain([0, 0.025])
    .range([dimensions.margin.top, 0]);
  
    var x2 = d3.scaleLinear()
    .domain([0, 100])
    .range([dimensions.boundedHeight, 0]);
  
    var y2 = d3.scaleLinear()
    .domain([0, 0.025])
    .range([dimensions.margin.right, 0]);
    
  
    // Compute kernel density estimation
    var kde1 = kernelDensityEstimator(kernelEpanechnikov(7), x1.ticks(40))
    var kde2 = kernelDensityEstimator(kernelEpanechnikov(7), x2.ticks(40))
    var density1 =  kde1( dataset.map(function(d){  return d.temperatureMin; }) )
    var density2 =  kde2( dataset.map(function(d){  return d.temperatureMax; }) )
  
    // Plot the area
    wrapper.append("path")
        .attr("class", "mypath")
        .datum(density1)
        .attr("fill", "grey")
        .attr("opacity", ".3")
        .attr("d",  d3.line()
          .curve(d3.curveBasis)
            .x(function(d) { return x1(d[0]); })
            .y(function(d) { return y1(d[1]); })
        )
        .attr("transform", "translate(50, 0)");
  
    wrapper.append("path")
      .attr("class", "mypath")
      .datum(density2)
      .attr("fill", "grey")
      .attr("opacity", ".3")
      .attr("d",  d3.line()
        .curve(d3.curveBasis)
          .y(function(d) { return dimensions.boundedHeight+90-x1(d[0]); })
          .x(function(d) { return dimensions.boundedWidth+140-y1(d[1]); })
        )
        //.attr("transform", "matrix(0, 1, -1, 0, 680, 90)") 
        //.attr("transform", "translate(0, 90)");

    // Function to compute density
    function kernelDensityEstimator(kernel, X) {
      return function(V) {
        return X.map(function(x) {
          return [x, d3.mean(V, function(v) { return kernel(x - v); })];
        });
      };
    }
    function kernelEpanechnikov(k) {
      return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
      };
    }
  
    // 6. Draw peripherals
  
    const xAxisGenerator = d3.axisBottom()
      .scale(xScale)
      .ticks(4)
  
    const xAxis = bounds.append("g")
      .call(xAxisGenerator)
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)
  
    const xAxisLabel = xAxis.append("text")
        .attr("class", "x-axis-label")
        .attr("x", dimensions.boundedWidth / 2)
        .attr("y", dimensions.margin.bottom - 10)
        .html("Minimum Temperature (&deg;F)")
  
    const yAxisGenerator = d3.axisLeft()
      .scale(yScale)
      .ticks(4)
  
    const yAxis = bounds.append("g")
        .call(yAxisGenerator)
  
    const yAxisLabel = yAxis.append("text")
        .attr("class", "y-axis-label")
        .attr("x", -dimensions.boundedHeight / 2)
        .attr("y", -dimensions.margin.left + 10)
        .html("Maximum Temperature (&deg;F)")
  
    const legendGroup = bounds.append("g")
        .attr("transform", `translate(${
          dimensions.boundedWidth - dimensions.legendWidth - 9
        },${
          dimensions.boundedHeight - 37
        })`)
  
    const defs = wrapper.append("defs")
  
    const numberOfGradientStops = 10
    const stops = d3.range(numberOfGradientStops).map(i => (
      i / (numberOfGradientStops - 1)
    ))
    const legendGradientId = "legend-gradient"
    const gradient = defs.append("linearGradient")
        .attr("id", legendGradientId)
      .selectAll("stop")
      .data(stops)
      .join("stop")
        .attr("stop-color", d => d3.interpolateRainbow(-d))
        .attr("offset", d => `${d * 100}%`)
  
    var legendGradient = legendGroup.append("rect")
        .attr("height", dimensions.legendHeight)
        .attr("width", dimensions.legendWidth)
        .style("fill", `url(#${legendGradientId})`)
  
    const tickValues = [
      d3.timeParse("%m/%d/%Y")(`4/1/${colorScaleYear}`),
      d3.timeParse("%m/%d/%Y")(`7/1/${colorScaleYear}`),
      d3.timeParse("%m/%d/%Y")(`10/1/${colorScaleYear}`),
    ]

    const legendTickScale = d3.scaleOrdinal()
    .domain(["Apr", "Jul", "Oct"])
    .range([dimensions.legendWidth/4, dimensions.legendWidth/2, 3*dimensions.legendWidth/4])
  
    const legendValues = legendGroup.selectAll(".legend-value")
      .data(tickValues)
      .join("text")
        .attr("class", "legend-value")
        .attr("x", legendTickScale)
        .attr("y", -6)
        .text(d3.timeFormat("%b"))
  
    const legendValueTicks = legendGroup.selectAll(".legend-tick")
      .data(tickValues)
      .join("line")
        .attr("class", "legend-tick")
        .attr("x1", legendTickScale)
        .attr("x2", legendTickScale)
        .attr("y1", 6)
  
    // Set up interactions
  
    // create voronoi for tooltips
    const delaunay = d3.Delaunay.from(
      dataset,
      d => xScale(xAccessor(d))+50,
      d => yScale(yAccessor(d))+90,
    )
  
    const voronoiPolygons = delaunay.voronoi()
    voronoiPolygons.xmax = dimensions.boundedWidth+50
    voronoiPolygons.ymax = dimensions.boundedHeight+50
  
    const voronoi = dotsGroup.selectAll(".voronoi")
      .data(dataset)
        .join("path")
        .attr("class", "voronoi")
        .attr("d", (d,i) => voronoiPolygons.renderCell(i))
  
    // add two mouse events in the tooltip
  
    voronoi.on("mouseenter", onVoronoiMouseEnter)
      .on("mouseleave", onVoronoiMouseLeave)
  
    const tooltip = d3.select("#tooltip")
    const hoverElementsGroup = bounds.append("g")
        .attr("opacity", 0)
  
    const dayDot = hoverElementsGroup.append("circle")
        .attr("class", "tooltip-dot")
    
    const highlightedbar1 = wrapper.append("rect");
    const highlightedbar2 = wrapper.append("rect");
  
    function onVoronoiMouseEnter(e, datum) {
  
      //Given the mouse event and a datum, you are asked to highlight the data by adding an addtioanl circle and display its information (such as date and temperature).
        
      // To DO

        let pos = d3.pointer(e);
        let i = delaunay.find(pos[0], pos[1]);
        
        hoverElementsGroup.style("opacity", 1);
        dayDot
            .attr('cx', xScale(xAccessor(dataset[i])))
            .attr('cy', yScale(yAccessor(dataset[i])))
            .attr('r', 7)
            .style('stroke', "blue");
        tooltip
          .style("left", xScale(xAccessor(dataset[i])) - 70 + "px")
          .style("top", yScale(yAccessor(dataset[i])) + "px")
          .style("opacity", 1);
        week = formatWeek(parseDate(dataset[i].date).setYear(2018));
        month = formatMonth(parseDate(dataset[i].date).setYear(2018));
        day = parseInt(formatDay(parseDate(dataset[i].date).setYear(2018)));
        document.getElementById("date").innerHTML = `${week}, ${month} ${day}, 2018`;
        document.getElementById("min-temperature").innerHTML = dataset[i].temperatureMax;
        document.getElementById("max-temperature").innerHTML = dataset[i].temperatureMin;
        // add highlightedbar1
        highlightedbar1
        .attr("x", xScale(xAccessor(dataset[i]))+50)
        .attr("y", 0) 
        .attr("width", 10)
        .attr("height", 90)
        .style("fill", colorScale(colorAccessor(dataset[i])))
        .style("opacity", 1);

        highlightedbar2
        .attr("x", dimensions.boundedWidth+50)
        .attr("y", yScale(yAccessor(dataset[i]))+90) 
        .attr("width", 90)
        .attr("height", 10)
        .style("fill", colorScale(colorAccessor(dataset[i])))
        .style("opacity", 1)
        ;

    }
  
    function onVoronoiMouseLeave() {
      highlightedbar1.style("opacity", 0)
      highlightedbar2.style("opacity", 0)
      hoverElementsGroup.style("opacity", 0)
      tooltip.style("opacity", 0)
    }
  
    // add two mouse actions on the legend
    legendGradient.on("mousemove", onLegendMouseMove)
      .on("mouseleave", onLegendMouseLeave)
  
    const legendHighlightBarWidth = dimensions.legendWidth * 0.05
    const legendHighlightGroup = legendGroup.append("g")
        .attr("opacity", 0)
    const legendHighlightBar = legendHighlightGroup.append("rect")
        .attr("class", "legend-highlight-bar")
        .attr("width", legendHighlightBarWidth)
        .attr("height", dimensions.legendHeight)
  
    const legendHighlightText = legendHighlightGroup.append("text")
        .attr("class", "legend-highlight-text")
        .attr("x", legendHighlightBarWidth / 2)
        .attr("y", -6)


    // Compute kernel density estimation
    //var kde1 = kernelDensityEstimator(kernelEpanechnikov(7), x1.ticks(40))
    
  
    // Plot the area
    var highlightedmargin1 = wrapper.append("path")
    var highlightedmargin2 = wrapper.append("path")

  
    function onLegendMouseMove(e) {  
      // Display the data only when the data are in the selected date range.

      let posx = d3.pointer(e)[0] 
      let b = parseInt(posx*20/250);
      let i1 = parseInt(b/20*364);
      let i2 = parseInt((b+1)/20*364);
      let ts1 = dataset[i1].date;
      let ts2 = dataset[i2].date;
      legendHighlightBar
        .attr("x", b*legendHighlightBarWidth);
      let monthday1 = formatMonthDay(parseDate(dataset[i1].date).setYear(2018));
      let monthday2 = formatMonthDay(parseDate(dataset[i2].date).setYear(2018));
      legendHighlightText
        .text(`${monthday1} - ${monthday2}`)
        .attr("x", b*legendHighlightBarWidth);
      
      let cand = [];
      for (I = i1; I <= i2; I++) {
        cand.push(dataset[I]);
      }
      var density11 =  kde1( cand.map(function(d){  return d.temperatureMin; }) )
      highlightedmargin1.style("opacity", 1)
      highlightedmargin1
        .attr("class", "mypath")
        .datum(density11)
        .attr("fill", d3.interpolateRainbow(-(i1+9)/365))
        .attr("d",  d3.line()
          .curve(d3.curveBasis)
            .x(function(d) { return x1(d[0]); })
            .y(function(d) { return y1(d[1]*(i2-i1+1)/365); })
        )
        .attr("transform", "translate(50, 0)");
        var density22 =  kde2( cand.map(function(d){  return d.temperatureMax; }) )
        highlightedmargin2.style("opacity", 1)
        highlightedmargin2
          .attr("class", "mypath")
          .datum(density22)
          .attr("fill", d3.interpolateRainbow(-(i1+9)/365))
          .attr("d",  d3.line()
            .curve(d3.curveBasis)
              //.x(function(d) { return x2(d[0]); })
              //.y(function(d) { return y2(d[1]*(i2-i1+1)/365); })
              .y(function(d) { return dimensions.boundedHeight+90-x1(d[0]); })
              .x(function(d) { return dimensions.boundedWidth+140-y2(d[1]*(i2-i1+1)/365); })
          )
          //.attr("transform", "matrix(0, 1, -1, 0, 760, 90)"); 
             
          
        
      test2
      .style("opacity", function (d) { return (d.date >= ts1 && d.date <= ts2) ? 1 : 0.1; });

  
      legendValues.style("opacity", 0)
      legendValueTicks.style("opacity", 0)
      legendHighlightGroup.style("opacity", 1)
  
    }
  
    function onLegendMouseLeave() {
      highlightedmargin1.style("opacity", 0);
      highlightedmargin2.style("opacity", 0);


      test2
      .style("opacity",1)

      legendValues.style("opacity", 1)
      legendValueTicks.style("opacity", 1)
      legendHighlightGroup.style("opacity", 0)
    }
  
  }
  drawScatter()