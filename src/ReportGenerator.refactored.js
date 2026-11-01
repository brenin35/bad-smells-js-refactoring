const PRIORITY_THRESHOLD = 1000;
const USER_VALUE_LIMIT = 500;

/**
 * Regras de visibilidade por papel (role) do usuário.
 * - Admins veem tudo.
 * - Users comuns só veem itens com valor <= 500.
 */
const VISIBILITY_RULES = {
  ADMIN: () => true,
  USER: (item) => item.value <= USER_VALUE_LIMIT,
};

class CsvFormatter {
  header() {
    return ['ID,NOME,VALOR,USUARIO'];
  }

  row(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}`;
  }

  footer(total) {
    return ['', 'Total,,', `${total},,`];
  }
}

class HtmlFormatter {
  header(user) {
    return [
      '<html><body>',
      '<h1>Relatório</h1>',
      `<h2>Usuário: ${user.name}</h2>`,
      '<table>',
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>',
    ];
  }

  row(item, user) {
    const style = isPriority(item, user) ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>`;
  }

  footer(total) {
    return ['</table>', `<h3>Total: ${total}</h3>`, '</body></html>'];
  }
}

const FORMATTERS = {
  CSV: new CsvFormatter(),
  HTML: new HtmlFormatter(),
};

function isPriority(item, user) {
  return user.role === 'ADMIN' && item.value > PRIORITY_THRESHOLD;
}

function visibleItems(items, user) {
  const isVisible = VISIBILITY_RULES[user.role] ?? (() => false);
  return items.filter(isVisible);
}

function sumValues(items) {
  return items.reduce((total, item) => total + item.value, 0);
}

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const formatter = FORMATTERS[reportType];
    if (!formatter) {
      return '';
    }

    const visible = visibleItems(items, user);
    const lines = [
      ...formatter.header(user),
      ...visible.map((item) => formatter.row(item, user)),
      ...formatter.footer(sumValues(visible)),
    ];

    return lines.join('\n').trim();
  }
}
