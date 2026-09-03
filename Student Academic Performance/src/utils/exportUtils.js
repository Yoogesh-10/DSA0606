// Helper utilities to handle CSV export and printing

export const exportToCSV = (filename, data) => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.join(','));

  // Data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const val = row[header] === null || row[header] === undefined ? '' : row[header];
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const triggerPrint = () => {
  window.print();
};
