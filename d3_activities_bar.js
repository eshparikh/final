const svg3 = d3.select("#activities").append("svg").attr("width", 700).attr("height", 350);
const g3 = svg3.append("g").attr("transform", "translate(80,40)");

d3.json("student_d3_final_data.json").then(data => {
  data.forEach(d => {
    d.Num_Activities = +d.Num_Activities;
    d.GPA = +d.GPA;
  });

  const bins = [0, 1, 2, 3, 4];
  const binData = bins.map(b => {
    const group = data.filter(d => d.Num_Activities === b || (b === 4 && d.Num_Activities >= 4));
    return {
      label: b === 4 ? "4+" : b.toString(),
      avgGPA: group.length ? d3.mean(group, d => d.GPA) : 0
    };
  });

  const x = d3.scaleBand().domain(binData.map(d => d.label)).range([0, 500]).padding(0.2);
  const y = d3.scaleLinear().domain([0, 4]).range([250, 0]);
  const color = d3.scaleSequential(d3.interpolateOranges).domain([1, 4]);

  // Axes
  g3.append("g").call(d3.axisLeft(y)).append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -130)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("class", "axis-label")
    .text("Avg GPA");

  g3.append("g").attr("transform", `translate(0,250)`).call(d3.axisBottom(x)).append("text")
    .attr("x", 250)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Number of Activities");

  // Bars with gradient color
  g3.selectAll("rect")
    .data(binData)
    .enter().append("rect")
    .attr("x", d => x(d.label))
    .attr("y", d => y(d.avgGPA))
    .attr("width", x.bandwidth())
    .attr("height", d => 250 - y(d.avgGPA))
    .attr("fill", d => color(d.avgGPA))
    .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.2))");

  // GPA labels above bars
  g3.selectAll("text.bar")
    .data(binData)
    .enter()
    .append("text")
    .attr("class", "bar")
    .attr("x", d => x(d.label) + x.bandwidth() / 2)
    .attr("y", d => y(d.avgGPA) - 8)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("fill", "#333")
    .text(d => d.avgGPA.toFixed(2));

  // Gradient legend
  const legendScale = d3.scaleLinear().domain([1, 4]).range([0, 120]);
  const legend = svg3.append("g").attr("transform", "translate(550,40)");

  const legendData = d3.range(1, 4.05, 0.05);
  legend.selectAll("rect")
    .data(legendData)
    .enter().append("rect")
    .attr("x", d => legendScale(d))
    .attr("y", 0)
    .attr("width", 120 / legendData.length)
    .attr("height", 12)
    .attr("fill", d => color(d));

  legend.append("g")
    .attr("transform", "translate(0,12)")
    .call(d3.axisBottom(legendScale).ticks(4).tickFormat(d => d.toFixed(1)))
    .select(".domain").remove();

  svg3.append("text")
    .attr("x", 590)
    .attr("y", 35) 
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold") 
    .text("Average GPA");
});
