const svg2 = d3.select("#heatmap")
  .append("svg")
  .attr("width", 600)
  .attr("height", 450);

const g2 = svg2.append("g").attr("transform", "translate(100,30)");

d3.json("student_d3_final_data.json").then(data => {
  const xVals = Array.from(new Set(data.map(d => d.ParentalEducation))).sort();
  const yVals = Array.from(new Set(data.map(d => d.ParentalSupport))).sort().reverse(); // reversed here

  const x = d3.scaleBand().domain(xVals).range([0, 350]).padding(0.1);
  const y = d3.scaleBand().domain(yVals).range([0, 300]).padding(0.1);
  const color = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 4]);

  const matrix = {};
  xVals.forEach(xVal => {
    yVals.forEach(yVal => {
      const group = data.filter(d => d.ParentalEducation === xVal && d.ParentalSupport === yVal);
      matrix[`${xVal}-${yVal}`] = d3.mean(group, d => d.GPA) || 0;
    });
  });

  g2.append("g").call(d3.axisLeft(y));
  g2.append("g").attr("transform", `translate(0,300)`).call(d3.axisBottom(x));

  xVals.forEach(xVal => {
    yVals.forEach(yVal => {
      g2.append("rect")
        .attr("x", x(xVal))
        .attr("y", y(yVal))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", color(matrix[`${xVal}-${yVal}`]))
        .append("title")
        .text(`GPA: ${matrix[`${xVal}-${yVal}`].toFixed(2)}`);
    });
  });

  // Axis labels
  svg2.append("text")
    .attr("x", 300)
    .attr("y", 375)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Parental Education");

  svg2.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(60,225)rotate(-90)")
    .attr("class", "axis-label")
    .text("Parental Support");

  // Color Legend
  const legendWidth = 120;
  const legendHeight = 12;
  const legendX = d3.scaleLinear().domain([0, 4]).range([0, legendWidth]);

  const legend = svg2.append("g")
    .attr("transform", "translate(480,60)");

  const legendData = d3.range(0, 4.05, 0.05);

  legend.selectAll("rect")
    .data(legendData)
    .enter().append("rect")
    .attr("x", d => legendX(d))
    .attr("y", 0)
    .attr("width", legendWidth / legendData.length)
    .attr("height", legendHeight)
    .attr("fill", d => color(d));

  legend.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(d3.axisBottom(legendX).ticks(5))
    .select(".domain").remove();

  svg2.append("text")
    .attr("x", 520)
    .attr("y", 55)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold") 
    .text("Average GPA");
});