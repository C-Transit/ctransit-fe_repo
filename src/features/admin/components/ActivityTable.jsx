import styles from './ActivityTable.module.css';

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export default function ActivityTable({ rows }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Reference</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.type}</td>
              <td>{row.reference}</td>
              <td>{row.user}</td>
              <td>{currencyFormatter.format(row.amount)}</td>
              <td>
                <span className={`${styles.statusTag} ${styles[row.status.toLowerCase()]}`.trim()}>{row.status}</span>
              </td>
              <td>{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
