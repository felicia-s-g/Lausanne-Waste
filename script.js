const width = window.innerWidth, height = window.innerHeight;

const svg = d3.select("#viz")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("width", width)
  .attr("height", height)
  .attr("style", `max-width: 100%; height: auto; display: block; margin: auto; background: #000; cursor: pointer;`);

const tooltip = d3.select("#tooltip");
const demog = d3.select("#demog");
const flexBar = d3.select("#flex-bar");

let level = true;
let labels = "";
let population = "";
let table = "";

const materialColors = {
  "Non-recyclable": "#8A3FFC",
  "Paper": "#D2A106",
  "Vegetable": "#007D79",
  "Iron": "#D12771",
  "Glass": "#4589FF"
};

const opacityScale = d3.scaleLinear()
  .domain([0.82, 0.34])
  .range(["#006d2c", "#edf8e9"]);

const populationScale = d3.scaleLinear()
  .domain([1000, 17000])
  .range([20, 100]);

const data = await d3.json('data.json');

function getDistrict(j) {
  for (const element of j) {
    let ratioPop = populationScale(element.swiss + element.foreign);
    table += `
      <tr>
          <td>${element.name}</td>
          <td><div class="bar" style="width: ${ratioPop}%;">${element.swiss + element.foreign}</div></td>
      </tr>
    `
    labels += `<li>${element.name}</li>`;
    population += ` <div class="bar" style="width: 90%;">${element.swiss + element.foreign}</div>`
  }
}

getDistrict(data.children);

const pack = d3.pack()
  .size([width, height])
  .padding(10);

const root = pack(d3.hierarchy(data)
  .sum(d => d.value || d.waste_total)
  .sort((a, b) => b.value - a.value));

focus = root;
let view = [focus.x, focus.y, focus.r * 4.2];

// Highlight function
function highlightDistrict(districtId, highlight = true) {
  const row = document.querySelector(`#district-row-${districtId}`);
  if (row) {
    if (highlight) {
      row.classList.add('highlighted');
    } else {
      row.classList.remove('highlighted');
    }
  }
}

// circles
const node = svg.append("g")
  .selectAll("circle")
  .data(root.descendants().slice(1))
  .join("circle")
  .attr("fill", (d) => materialColors[d.data.name] || "#egegeg")
  .attr("stroke", (d) => d.children ? "white" : "none")
  .attr("stroke-width", (d) => d.children ? d.data.scaled_rec_efficiency_per_capita/7 : 0)
  .attr("opacity", (d) =>
    d.depth === 1 ? opacityScale(d.data.recyclingEfficiency || 0.5) : 1
  )
  .attr("pointer-events", function (d) {
    if (focus === root) {
      return d.depth === 1 ? "all" : "none";
    } else {
      return (d.depth === 1 || d.depth === 2) ? "all" : "none";
    }
  })
  .on("mouseover", function (event, d) {
    const content = getTooltipContent(d);
    if (content) {
      tooltip.style("display", "block").html(content);
    }
    // Add highlight when hovering over district
    if (d.depth === 1) {
      highlightDistrict(d.data.id, true);
    }
  })
  .on("mousemove", function (event) {
    tooltip
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY + 10 + "px");
  })
  .on("mouseout", function (event, d) {
    tooltip.style("display", "none");
    // Remove highlight when mouse leaves district
    if (d.depth === 1) {
      highlightDistrict(d.data.id, false);
    }
  })
  .on("click", (event, d) => {
    if (focus === root && d.depth === 1) {
      zoom(event, d);
      event.stopPropagation();
    }
    if (level) {
      const side = getSidebarContent1(d);
      demog.html(side);
      flexBar.html("");
      level = false;
    }
    else if (!level) {
      const side = getSidebarContent2(d);
      demog.html("");
      flexBar.html(side);
      level = true;
    }
  });

const label = svg.append("g")
  .style("font", "20px sans-serif")
  .attr("pointer-events", "none")
  .selectAll("text")
  .data(root.descendants().slice(1))
  .join("text")
  .attr("text-anchor", "middle")
  .style("fill-opacity", d => d.parent === root ? 1 : 0)
  .style("display", d => d.parent === root ? "inline" : "none")
  .style("fill", "white")
  .text(d => d.data.name);

function getSidebarContent1(d) {
  return `
          <strong>${d.data.name}</strong><br/>
          Population: ${d.data.swiss + d.data.foreign || "N/A"}<br/>
          Swiss: ${d.data.swiss || "N/A"}<br/>
          Non-Swiss: ${d.data.foreign || "N/A"}<br/>
          Swiss percentage: ${d.data.swiss_percentage || "N/A"} %
        `;
}

function getSidebarContent2(d) {
  table = '';
  for (const element of data.children) {
    let ratioPop = populationScale(element.swiss + element.foreign);
    table += `
      <tr class="district-row" id="district-row-${element.id}">
          <td>${element.name}</td>
          <td><div class="bar" style="width: ${ratioPop}%;">${element.swiss + element.foreign}</div></td>
      </tr>
    `;
  }

  return `
    <div class="table-container">
        <table>
            <tbody>
                ${table}
            </tbody>
        </table>
    </div>
  `;
}

function getTooltipContent(d) {
  if (focus.depth === 0 && d.depth === 1) {
    return `
          <strong>${d.data.name}</strong><br/>
          Population: ${d.data.swiss + d.data.foreign || "N/A"}<br/>
          Swiss: ${d.data.swiss || "N/A"}<br/>
          Non-Swiss: ${d.data.foreign || "N/A"}<br/>
          Swiss percentage: ${d.data.swiss_percentage || "N/A"} %
        `;
  }

  if (focus.depth === 1 && d.depth === 2) {
    return `
          <strong>${d.data.name}</strong><br/>
          ${d.data.percentage} <br/>
          ${d.data.value || "N/A"} kg
        `;
  }

  return "";
}

svg.on("click", (event) => zoom(event, root));
zoomTo(view);

function zoomTo(v) {
  const k = width / v[2];
  view = v;

  node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
  node.attr("r", d => d.r * k);

  label.attr("transform", d => 
    `translate(${(d.x - v[0]) * k}, ${(d.y - v[1]) * k - d.r * k - 10})`
  );
}

function zoom(event, d) {
  focus = d;

  node.attr("pointer-events", function (d) {
    if (focus === root) {
      const side = getSidebarContent2(d);
      demog.html("");
      flexBar.html(side);
      level = true;
      return d.depth === 1 ? "all" : "none";
    } else {
      return (d.depth === 1 || d.depth === 2) ? "all" : "none";
    }
  });

  const transition = svg.transition()
    .duration(750)
    .tween("zoom", () => {
      const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 4.2]);
      return t => zoomTo(i(t));
    });

  label.filter(function (d) {
    return d.parent === focus || d3.select(this).style("display") === "inline";
  })
    .transition(transition)
    .style("fill-opacity", d => d.parent === focus ? 1 : 0)
    .on("start", function (d) {
      if (d.parent === focus) d3.select(this).style("display", "inline");
    })
    .on("end", function (d) {
      if (d.parent !== focus) d3.select(this).style("display", "none");
    });
}

const toggleButton = document.createElement("button");
toggleButton.textContent = "Toggle Population Influence";
toggleButton.style.position = "absolute";
toggleButton.style.top = "20px";
toggleButton.style.left = "20px";
toggleButton.style.zIndex = "10";
document.body.appendChild(toggleButton);

let moveCircles = false;

toggleButton.addEventListener("click", () => {
  moveCircles = !moveCircles;
  updateCirclePositions();
});

function updateCirclePositions() {
  node.transition()
    .duration(d => Math.random() * 1000 + 500)
    .delay(d => Math.random() * 500)
    .attr("transform", d => {
      let parentOffsetX = 0;
      if (d.parent) {
        if (d.parent.data.swiss !== undefined && d.parent.data.foreign !== undefined) {
          parentOffsetX = moveCircles ? (d.parent.data.swiss > d.parent.data.foreign ? -400 : 400) : 0;
        }
      }
      let offsetX = 0;
      if (d.data.swiss !== undefined && d.data.foreign !== undefined) {
        offsetX = moveCircles ? (d.data.swiss > d.data.foreign ? -400 : 400) : 0;
      }

      let r = d.r;
      if (moveCircles) {
        r = d.r * 1.2;
      }
      return `translate(${(d.x - view[0]) + parentOffsetX + offsetX}, ${(d.y - view[1])})`;
    });

  label.transition()
    .duration(d => Math.random() * 1000 + 500)
    .delay(d => Math.random() * 500)
    .attr("transform", d => {
      let parentOffsetX = 0;
      if (d.parent) {
        if (d.parent.data.swiss !== undefined && d.parent.data.foreign !== undefined) {
          parentOffsetX = moveCircles ? (d.parent.data.swiss > d.parent.data.foreign ? -400 : 400) : 0;
        }
      }
      let offsetX = 0;
      if (d.data.swiss !== undefined && d.data.foreign !== undefined) {
        offsetX = moveCircles ? (d.data.swiss > d.data.foreign ? -400 : 400) : 0;
      }
      return `translate(${(d.x - view[0]) + parentOffsetX + offsetX}, ${(d.y - view[1]) - d.r})`;
    });
}

