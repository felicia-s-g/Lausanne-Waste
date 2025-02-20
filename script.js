document.addEventListener("DOMContentLoaded", function () {
  const width = 1200; 
  const height = 900;

  const svg = d3.select("#viz")
    .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .attr("style", `max-width: 100%; height: auto; display: block; margin: auto; background: #f4f4f4; cursor: pointer;`);


  const tooltip = d3.select("#tooltip");

  // colours
  const materialColors = {
    "Non-recyclable": "#d3d3d3", // Light Grey
    "Paper": "#f8de7e",         // Pastel Yellow
    "Vegetable": "#a1c181",     // Pastel Green
    "Iron": "#ff6961",          // Pastel Red
    "Glass": "#9db4ff"          // Pastel Blue
  };

  const opacityScale = d3.scaleLinear().domain([0.1, 0.6]).range([0.1, 1]);

  //data structure
  const data = {
    "name": "Lausanne",
    "children": [
      {
        "id": 1,
        "name": "Centre",
        "waste_total": 2974399,
        "recyclingEfficiency": 0.35,
        "swiss": 7087,
        "foreign": 5989,
        "swiss_percentage": 54.2,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 1761444
          },
          {
            "name": "Paper",
            "value": 597598
          },
          {
            "name": "Glass",
            "value": 451420
          },
          {
            "name": "Iron",
            "value": 8030
          },
          {
            "name": "Vegetable",
            "value": 155906
          }
        ]
      },
      {
        "id": 2,
        "name": "Maupas-Valency",
        "waste_total": 1001411,
        "recyclingEfficiency": 0.54,
        "swiss": 7582,
        "foreign": 6089,
        "swiss_percentage": 55.5,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 444517
          },
          {
            "name": "Paper",
            "value": 252051
          },
          {
            "name": "Glass",
            "value": 130189
          },
          {
            "name": "Iron",
            "value": 2253
          },
          {
            "name": "Vegetable",
            "value": 172402
          }
        ]
      },
      {
        "id": 3,
        "name": "Sébeillon-Malley",
        "waste_total": 1161321,
        "recyclingEfficiency": 0.37,
        "swiss": 5904,
        "foreign": 5929,
        "swiss_percentage": 49.9,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 675233
          },
          {
            "name": "Paper",
            "value": 199686
          },
          {
            "name": "Glass",
            "value": 126270
          },
          {
            "name": "Iron",
            "value": 2119
          },
          {
            "name": "Vegetable",
            "value": 158013
          }
        ]
      },
      {
        "id": 4,
        "name": "Montoie-Bourdonnette",
        "waste_total": 754788,
        "recyclingEfficiency": 0.38,
        "swiss": 3809,
        "foreign": 4238,
        "swiss_percentage": 47.3,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 436634
          },
          {
            "name": "Paper",
            "value": 139775
          },
          {
            "name": "Glass",
            "value": 64890
          },
          {
            "name": "Iron",
            "value": 1804
          },
          {
            "name": "Vegetable",
            "value": 111685
          }
        ]
      },
      {
        "id": 5,
        "name": "Montriond-Cour",
        "waste_total": 859728,
        "recyclingEfficiency": 0.42,
        "swiss": 5184,
        "foreign": 3456,
        "swiss_percentage": 60.0,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 447811
          },
          {
            "name": "Paper",
            "value": 205267
          },
          {
            "name": "Glass",
            "value": 86684
          },
          {
            "name": "Iron",
            "value": 1709
          },
          {
            "name": "Vegetable",
            "value": 118257
          }
        ]
      },
      {
        "id": 6,
        "name": "Sous-Gare-Ouchy",
        "waste_total": 1024399,
        "recyclingEfficiency": 0.5,
        "swiss": 6822,
        "foreign": 4048,
        "swiss_percentage": 62.8,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 460326
          },
          {
            "name": "Paper",
            "value": 266317
          },
          {
            "name": "Glass",
            "value": 181224
          },
          {
            "name": "Iron",
            "value": 3564
          },
          {
            "name": "Vegetable",
            "value": 112969
          }
        ]
      },
      {
        "id": 7,
        "name": "Montchoisi",
        "waste_total": 293175,
        "recyclingEfficiency": 0.44,
        "swiss": 2329,
        "foreign": 1437,
        "swiss_percentage": 61.8,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 146585
          },
          {
            "name": "Paper",
            "value": 67610
          },
          {
            "name": "Glass",
            "value": 39314
          },
          {
            "name": "Iron",
            "value": 719
          },
          {
            "name": "Vegetable",
            "value": 38947
          }
        ]
      },
      {
        "id": 8,
        "name": "Florimont-Chissiez",
        "waste_total": 425534,
        "recyclingEfficiency": 0.61,
        "swiss": 3538,
        "foreign": 2305,
        "swiss_percentage": 60.6,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 190104
          },
          {
            "name": "Paper",
            "value": 111748
          },
          {
            "name": "Glass",
            "value": 45397
          },
          {
            "name": "Iron",
            "value": 1162
          },
          {
            "name": "Vegetable",
            "value": 77123
          }
        ]
      },
      {
        "id": 9,
        "name": "Mousquines-Bellevue",
        "waste_total": 287961,
        "recyclingEfficiency": 0.55,
        "swiss": 1761,
        "foreign": 995,
        "swiss_percentage": 63.9,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 126271
          },
          {
            "name": "Paper",
            "value": 89712
          },
          {
            "name": "Glass",
            "value": 24257
          },
          {
            "name": "Iron",
            "value": 3771
          },
          {
            "name": "Vegetable",
            "value": 43951
          }
        ]
      },
      {
        "id": 10,
        "name": "Vallon-Béthusy",
        "waste_total": 618905,
        "recyclingEfficiency": 0.42,
        "swiss": 3821,
        "foreign": 2749,
        "swiss_percentage": 58.2,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 346338
          },
          {
            "name": "Paper",
            "value": 125761
          },
          {
            "name": "Glass",
            "value": 57715
          },
          {
            "name": "Iron",
            "value": 1597
          },
          {
            "name": "Vegetable",
            "value": 87494
          }
        ]
      },
      {
        "id": 11,
        "name": "Chailly-Rovéréaz",
        "waste_total": 803647,
        "recyclingEfficiency": 0.58,
        "swiss": 6311,
        "foreign": 3314,
        "swiss_percentage": 65.6,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 333653
          },
          {
            "name": "Paper",
            "value": 210760
          },
          {
            "name": "Glass",
            "value": 71492
          },
          {
            "name": "Iron",
            "value": 2077
          },
          {
            "name": "Vegetable",
            "value": 185665
          }
        ]
      },
      {
        "id": 12,
        "name": "Sallaz-Vennes-Séchaud",
        "waste_total": 1182038,
        "recyclingEfficiency": 0.71,
        "swiss": 9063,
        "foreign": 7168,
        "swiss_percentage": 55.8,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 371756
          },
          {
            "name": "Paper",
            "value": 345050
          },
          {
            "name": "Glass",
            "value": 105741
          },
          {
            "name": "Iron",
            "value": 2939
          },
          {
            "name": "Vegetable",
            "value": 356552
          }
        ]
      },
      {
        "id": 13,
        "name": "Sauvabelin",
        "waste_total": 100847,
        "recyclingEfficiency": 0.34,
        "swiss": 486,
        "foreign": 523,
        "swiss_percentage": 48.2,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 62300
          },
          {
            "name": "Paper",
            "value": 9788
          },
          {
            "name": "Glass",
            "value": 6887
          },
          {
            "name": "Iron",
            "value": 299
          },
          {
            "name": "Vegetable",
            "value": 21573
          }
        ]
      },
      {
        "id": 14,
        "name": "Borde-Bellevaux",
        "waste_total": 651529,
        "recyclingEfficiency": 0.51,
        "swiss": 5283,
        "foreign": 4472,
        "swiss_percentage": 54.2,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 300630
          },
          {
            "name": "Paper",
            "value": 144657
          },
          {
            "name": "Glass",
            "value": 71420
          },
          {
            "name": "Iron",
            "value": 1769
          },
          {
            "name": "Vegetable",
            "value": 133054
          }
        ]
      },
      {
        "id": 15,
        "name": "Vinet-Pontaise",
        "waste_total": 604273,
        "recyclingEfficiency": 0.55,
        "swiss": 4169,
        "foreign": 3241,
        "swiss_percentage": 56.3,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 262026
          },
          {
            "name": "Paper",
            "value": 158327
          },
          {
            "name": "Glass",
            "value": 80578
          },
          {
            "name": "Iron",
            "value": 2739
          },
          {
            "name": "Vegetable",
            "value": 100603
          }
        ]
      },
      {
        "id": 16,
        "name": "Bossons-Blécherette",
        "waste_total": 835132,
        "recyclingEfficiency": 0.44,
        "swiss": 5280,
        "foreign": 3980,
        "swiss_percentage": 57.0,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 447306
          },
          {
            "name": "Paper",
            "value": 218010
          },
          {
            "name": "Glass",
            "value": 63239
          },
          {
            "name": "Iron",
            "value": 2231
          },
          {
            "name": "Vegetable",
            "value": 104346
          }
        ]
      },
      {
        "id": 17,
        "name": "Beaulieu-Grey-Boisy",
        "waste_total": 566180,
        "recyclingEfficiency": 0.47,
        "swiss": 4651,
        "foreign": 1684,
        "swiss_percentage": 73.4,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 275999
          },
          {
            "name": "Paper",
            "value": 150933
          },
          {
            "name": "Glass",
            "value": 69972
          },
          {
            "name": "Iron",
            "value": 1228
          },
          {
            "name": "Vegetable",
            "value": 68048
          }
        ]
      },
      {
        "id": 90,
        "name": "Zones-Foraines",
        "waste_total": 310804,
        "recyclingEfficiency": 0.82,
        "swiss": 3106,
        "foreign": 1979,
        "swiss_percentage": 61.1,
        "children": [
          {
            "name": "Non-recyclable",
            "value": 64265
          },
          {
            "name": "Paper",
            "value": 42506
          },
          {
            "name": "Glass",
            "value": 65052
          },
          {
            "name": "Iron",
            "value": 1166
          },
          {
            "name": "Vegetable",
            "value": 137815
          }
        ]
      }
    ]
  };

  console.log(data);

  // hierarchy and layout
  const pack = d3.pack()
    .size([width - 100, height - 100]) // prevent clipping
    .padding(4);

  const root = pack(d3.hierarchy(data)
    .sum(d => d.value || d.waste_total)
    .sort((a, b) => b.value - a.value));

  focus = root;
  let view = [focus.x, focus.y, focus.r * 2.5]; // zoomed out a bit more for better framing at init


  // circles
  const node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1)) // exclude root
    .join("circle")
    .attr("fill", (d) => materialColors[d.data.name] || opacityScale(d.data.recyclingEfficiency || 0.7))
    .attr("opacity", (d) =>
      d.depth === 1 ? opacityScale(d.data.recyclingEfficiency || 0.7) : 1
    )

    // Conditional pointer-event >>>>>>
    // "none" for nodes if zoomed out (focus.depth === 0),
    // otherwise "all"
    .attr("pointer-events", (d) => {
      if (!d.children && focus.depth === 0) {
        return "none"; // zoomed out => disable hover
      }
      return "all"; // otherwise enable pointer events
    })
    // Tooltip logic
    .on("mouseover", function (event, d) {
      const content = getTooltipContent(d);
      if (content) {
        d3.select(this).attr("stroke", "#000");
        tooltip.style("display", "block").html(content);
      }
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", null);
      tooltip.style("display", "none");
    })
    .on("click", (event, d) => {
      if (focus !== d) {
        zoom(event, d);
        event.stopPropagation();
      }
    });

  // text labels
  const label = svg.append("g")
    .style("font", "20px sans-serif")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants())
    .join("text")
    .style("fill-opacity", d => d.parent === root ? 1 : 0)
    .style("display", d => d.parent === root ? "inline" : "none")
    .text(d => d.data.name);

  // Tooltip helper
  function getTooltipContent(d) {
    // focus.depth === 0 => zoomed out (root)
    // focus.depth === 1 => zoomed in on a district
    // d.depth === 1 => district
    // d.depth === 2 => material

    // Zoomed out => show district tooltips only
    if (focus.depth === 0 && d.depth === 1) {
      return `
          <strong>${d.data.name}</strong><br/>
          Population: ${d.data.swiss+d.data.foreign || "N/A"}<br/>
          Swiss: ${d.data.swiss || "N/A"}<br/>
          Non-Swiss: ${d.data.foreign || "N/A"}<br/>
          Swiss percentage: ${d.data.swiss_percentage || "N/A"}
        `;
    }

    // Zoomed in on a district => show material tooltips only
    if (focus.depth === 1 && d.depth === 2) {
      return `
          <strong>${d.data.name}</strong><br/>
          Value: ${d.data.value || "N/A"}
        `;
    }

    // Otherwise, no tooltip
    return "";
  }

  // zooming
  svg.on("click", (event) => zoom(event, root));
  zoomTo(view);

  function zoomTo(v) {
    const k = width / v[2];
    view = v;

    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("r", d => d.r * k);
  }

  function zoom(event, d) {
    focus = d;

    // Update pointer-events each time we zoom, so that nodes become active/inactive as appropriate for the tooltip
    node.attr("pointer-events", (d) => {

      if (!d.children && focus.depth === 0) {
        return "none";
      }
      return "all";
    });

    const transition = svg.transition()
      .duration(750)
      .tween("zoom", () => {
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
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


  // Create the toggle button in HTML
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
    updateCirclePositions2();
  });

  function updateCirclePositions() {
    node.transition().duration(500).attr("transform", d => {
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
      return `translate(${(d.x - view[0]) + parentOffsetX + offsetX}, ${(d.y - view[1])})`;
    });

    label.transition().duration(500).attr("transform", d => {
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
      return `translate(${(d.x - view[0]) + parentOffsetX + offsetX}, ${(d.y - view[1])})`;
    });
  }

  function getXPosition(percentage) {
    return (percentage / 100) * 1200;
}

  function updateCirclePositions2() {
    node.transition().duration(500).attr("transform", d => {
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
      return `translate(${(parentOffsetX + offsetX)}, ${(d.y - view[1])})`;
    });

    label.transition().duration(500).attr("transform", d => {
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
      return `translate(${(parentOffsetX + offsetX)}, ${(d.y - view[1])})`;
    });
  }

});