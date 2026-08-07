const orders = JSON.parse(localStorage.getItem("orders")) || [];

const table = document.getElementById("orders-table");

if (orders.length > 0) {

    table.innerHTML = "";

    orders.forEach(order => {

        table.innerHTML += `
        <tr>
            <td>${order.fullname}</td>
            <td>${order.email}</td>
            <td>${order.phone}</td>
            <td>₦${order.total.toLocaleString()}</td>
            <td>${order.reference}</td>
        </tr>
        `;

    });

}