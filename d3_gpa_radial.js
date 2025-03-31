const width = 600;
const height = 600;
const innerRadius = 80;
const outerRadius = Math.min(width, height) / 2 - 60;

const svg = d3.select("#gpa")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const chart = svg.append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2 - 80})`);

d3.json("gpa_by_activity_simple.json").then(data => {
  const angle = d3.scaleBand()
    .domain(data.map(d => d.activity))
    .range([0, 2 * Math.PI])
    .align(0);

  const radius = d3.scaleLinear()
    .domain([0, 4])
    .range([innerRadius, outerRadius]);

  const color = d3.scaleSequential(d3.interpolateOranges)
    .domain([1.5, 3]);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(d => radius(d.avg_gpa))
    .startAngle(d => angle(d.activity))
    .endAngle(d => angle(d.activity) + angle.bandwidth())
    .padAngle(0.01)
    .padRadius(innerRadius);

  // Draw arcs
  const arcs = chart.append("g")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("fill", d => color(d.avg_gpa))
    .attr("d", arc)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .attr("opacity", 1)
    .on("mouseover", function (event, d) {
      d3.selectAll(".arc").attr("opacity", 0.2);
      d3.select(this).attr("opacity", 1);
      labels.style("opacity", label => label.activity === d.activity ? 1 : 0);
    })
    .on("mouseout", () => {
      d3.selectAll(".arc").attr("opacity", 1);
      labels.style("opacity", 0);
    })
    .append("title")
    .text(d => `${d.activity}: GPA ${d.avg_gpa.toFixed(2)}`);
    

  // Activity Labels (outer ring)
  chart.append("g")
    .selectAll("text.activity-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "activity-label")
    .attr("text-anchor", "middle")
    .attr("x", d => {
      const a = angle(d.activity) + angle.bandwidth() / 2 - Math.PI / 2;
      return Math.cos(a) * (outerRadius + 24);
    })
    .attr("y", d => {
      const a = angle(d.activity) + angle.bandwidth() / 2 - Math.PI / 2;
      return Math.sin(a) * (outerRadius + 24);
    })
    .text(d => d.activity)
    .style("font-size", "12px");

  // GPA Value Labels (hidden until hover)
  const labels = chart.append("g")
    .selectAll("text.gpa-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "gpa-label")
    .attr("text-anchor", "middle")
    .attr("x", d => {
      const a = angle(d.activity) + angle.bandwidth() / 2 - Math.PI / 2;
      return Math.cos(a) * (radius(d.avg_gpa) - 15);
    })
    .attr("y", d => {
      const a = angle(d.activity) + angle.bandwidth() / 2 - Math.PI / 2;
      return Math.sin(a) * (radius(d.avg_gpa) - 15);
    })
    .text(d => d.avg_gpa.toFixed(2))
    .style("font-size", "11px")
    .style("fill", "#333")
    .style("opacity", 0);

  // Legend
  const legendWidth = 120;
  const legendHeight = 12;
  const legendX = d3.scaleLinear().domain([1.5, 3]).range([0, legendWidth]);

  const legend = svg.append("g")
    .attr("transform", `translate(${width - 180},${height - 80})`);

  const legendData = d3.range(1.5, 3.01, 0.05);

  legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", d => legendX(d))
    .attr("y", 0)
    .attr("width", legendWidth / legendData.length)
    .attr("height", legendHeight)
    .attr("fill", d => color(d));

  legend.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(d3.axisBottom(legendX).ticks(4))
    .select(".domain").remove();

  svg.append("text")
    .attr("x", width - 150)
    .attr("y", height - 90)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold") 
    .text("GPA Scale");
});
