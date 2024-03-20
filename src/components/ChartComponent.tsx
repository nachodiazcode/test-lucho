import React, { useEffect, useState } from 'react';
import Plot from "react-plotly.js";

interface ChartProps {
  title: string;
}

const ChartComponent: React.FC<ChartProps> = ({ title }) => {
  const [data, setData] = useState<any>(null);
  const [indicators, setIndicators] = useState<String[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    fetch('https://mindicador.cl/api')
      .then(response => response.json())
      .then(apidata => {
        const availableIndicators = Object.keys(apidata);
        setIndicators(availableIndicators);
      })
      .catch(error => console.error('Hubo un error: ', error))
  }, []);

  useEffect(() => {
    if (selectedIndicator) {
      fetch(`https://mindicador.cl/api/${selectedIndicator}`)
        .then(response => response.json())
        .then(data => {
          const availableYears = data.serie.map((item: any) => new Date(item.fecha).getFullYear());
          setYears(Array.from(new Set(availableYears.map(String))));
        })
        .catch(err => console.error('Hubo un error: ', err));
    }
  }, [selectedIndicator]);

  useEffect(() => {
    if (selectedIndicator && selectedYear) {
      fetch(`https://mindicador.cl/api/${selectedIndicator}/${selectedYear}`)
        .then(response => response.json())
        .then(data => {
          // Aquí vamos a estructurar los datos para Plotly
          const plotData = [{
            x: data.serie.map((item: any) => item.fecha),
            y: data.serie.map((item: any) => item.valor),
            type: 'scatter',
            mode: 'lines+markers',
            name: selectedIndicator,
          }];
          setData(plotData);
        })
        .catch(err => console.error('Hubo un error: ', err));
    }
  }, [selectedIndicator, selectedYear]);

  const handleIndicatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIndicator(event.target.value);
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div className=" active  bg-gray-200" style={{ height: '100vh' }}>
      <header className="shadow-md p-4 bg-white mb-4">
        <form className="flex flex-wrap items-center justify-start">
          <div className="mb-2">
            <select
              value={selectedIndicator}
              onChange={handleIndicatorChange}
              className="p-2 border border-gray-300 rounded-md ml-1 mr-2"
              style={{ height: '40px' }}
            >
              <option value="">Selecciona un indicador</option>
              {indicators.map((indicator: any, index) => (
                <option key={index} value={indicator}>
                  {indicator}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2 ml-4">
            <div className="flex items-center">
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="p-2 border border-gray-300 rounded-md"
                style={{ height: '40px' }}
              >
                <option value="">Selecciona un año</option>
                {years.map((year: any, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </header>

      <hr />

      <section className=" p-4 mx-auto">
        {data && (
          <div>
            <Plot
              data={data}
              layout={{
                title: selectedIndicator,
                xaxis: { title: "Fecha" },
                yaxis: { title: "Valor" },
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default ChartComponent;