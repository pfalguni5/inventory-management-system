function GSTR2AReport() {
  return (
    <div className="page">

      <h2>GSTR-2A / 2B (Reference)</h2>
      <p>This report is for reference and reconciliation only.</p>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Invoice No</th>
              <th>Taxable Value</th>
              <th>GST Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rice Suppliers</td>
              <td>PI-101</td>
              <td>10,000</td>
              <td>1,800</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GSTR2AReport;
