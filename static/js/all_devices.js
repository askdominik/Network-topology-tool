const search = document.querySelector('.input-group input'),
    table_headings = document.querySelectorAll('thead th');

search.addEventListener('input', searchTable);

function searchTable() {
    const table_rows = document.querySelectorAll('tbody tr');
    table_rows.forEach((row, i) => {
        let table_data = row.textContent.toLowerCase(),
            search_data = search.value.toLowerCase();

        row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
        row.style.setProperty('--delay', i / 25 + 's');
    });

    document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i) => {
        visible_row.style.backgroundColor = (i % 2 == 0) ? 'transparent' : '#0000000b';
    });
}


table_headings.forEach((head, i) => {
    let sort_asc = true;
    head.onclick = () => {
        const table_rows = document.querySelectorAll('tbody tr');

        table_headings.forEach(head => head.classList.remove('active'));
        head.classList.add('active');

        document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
        table_rows.forEach(row => {
            row.querySelectorAll('td')[i].classList.add('active');
        })

        head.classList.toggle('asc', sort_asc);
        sort_asc = head.classList.contains('asc') ? false : true;

        sortTable(i, sort_asc);
    }
})


function sortTable(column, sort_asc) {
    const table_rows = document.querySelectorAll('tbody tr');

    [...table_rows].sort((a, b) => {
        let first_row = a.querySelectorAll('td')[column].textContent.toLowerCase(),
            second_row = b.querySelectorAll('td')[column].textContent.toLowerCase();

        return sort_asc ? (first_row < second_row ? 1 : -1) : (first_row < second_row ? -1 : 1);
    })
        .map(sorted_row => document.querySelector('tbody').appendChild(sorted_row));
}

const pdf_btn = document.querySelector('#toPDF');
const all_devices = document.querySelector('#all_devices');


const toPDF = function (all_devices) {
    const html_code = `
    <!DOCTYPE html>
    <link rel="stylesheet" type="text/css" href="static/all_devices.css">
    <main class="table" id="all_devices">${all_devices.innerHTML}</main>`;

    const new_window = window.open();
    new_window.document.write(html_code);

    setTimeout(() => {
        new_window.print();
        new_window.close();
    }, 400);
}

pdf_btn.onclick = () => {
    toPDF(all_devices);
}

// 4. Converting HTML table to JSON

const json_btn = document.querySelector('#toJSON');

const toJSON = function (table) {
    let table_data = [],
        t_head = [],

        t_headings = table.querySelectorAll('th'),
        t_rows = table.querySelectorAll('tbody tr');

    for (let t_heading of t_headings) {
        let actual_head = t_heading.textContent.trim().split(' ');

        t_head.push(actual_head.splice(0, actual_head.length - 1).join(' ').toLowerCase());
    }

    t_rows.forEach(row => {
        const row_object = {},
            t_cells = row.querySelectorAll('td');

        t_cells.forEach((t_cell, cell_index) => {
            row_object[t_head[cell_index]] = t_cell.textContent.trim();
        })
        table_data.push(row_object);
    })

    return JSON.stringify(table_data, null, 4);
}

json_btn.onclick = () => {
    const json = toJSON(all_devices);
    downloadFile(json, 'json', 'All_Devices.json')
}

const csv_btn = document.querySelector('#toCSV');

const toCSV = function (table) {
    const t_heads = table.querySelectorAll('th'),
        tbody_rows = table.querySelectorAll('tbody tr');

    const headings = [...t_heads].map(head => {
        let actual_head = head.textContent.trim().split(' ');
        return actual_head.splice(0, actual_head.length - 1).join(' ').toLowerCase();
    }).join(',');

    const table_data = [...tbody_rows].map(row => {
        const cells = row.querySelectorAll('td');
        return [...cells].map(cell => cell.textContent.replace(/,/g, ".").trim()).join(',');
    }).join('\n');

    return headings + '\n' + table_data;
}

csv_btn.onclick = () => {
    const csv = toCSV(all_devices);
    downloadFile(csv, 'csv', 'All_Devices.csv');
}

const excel_btn = document.querySelector('#toEXCEL');

const toExcel = function (table) {
    const wb = XLSX.utils.book_new();
    const ws_data = [];
    
    const t_heads = table.querySelectorAll('th');
    const headers = [...t_heads].map(head => {
        let actual_head = head.textContent.trim().split(' ');
        return actual_head.splice(0, actual_head.length - 1).join(' ').toLowerCase();
    });
    ws_data.push(headers);

    const tbody_rows = table.querySelectorAll('tbody tr');
    tbody_rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = [...cells].map(cell => cell.textContent.trim());
        ws_data.push(rowData);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, 'All_Devices.xlsx');
};

excel_btn.onclick = () => {
    toExcel(document.querySelector('#all_devices'));
};

const downloadFile = function (data, fileType, fileName = '') {
    const a = document.createElement('a');
    a.download = fileName;
    const mime_types = {
        'json': 'application/json',
        'csv': 'text/csv',
        'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    a.href = `
        data:${mime_types[fileType]};charset=utf-8,${encodeURIComponent(data)}
    `;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

document.addEventListener('DOMContentLoaded', () => {
    const devicesTbody = document.getElementById('devices_tbody');
    
    const eventSource = new EventSource('/devices-stream');
    
    eventSource.onmessage = function(event) {
        const devices = JSON.parse(event.data);
        console.log(devices)
        devicesTbody.innerHTML = '';
        
        devices.nodes.forEach(device => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${device.id}</td>
                <td><p class="status ${device.status === 'up' ? 'up' : 'down'}">${device.status}</p></td>
                <td>${device.ChassisId}</td>
                <td>${device.PortDesc}</td>
                <td>${device.PortId}</td>
                <td>${device.SysCapEnabled}</td>
                <td>${device.SysCapSupported}</td>
                <td>${device.SysDesc}</td>
                <td>${device.SysName}</td>
            `;
            
            devicesTbody.appendChild(row);
        });
    };
});
