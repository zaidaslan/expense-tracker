

const API_URL = "http://localhost:3000/api/expenses";
let expenses=[];

const expenseForm=document.getElementById("expenseForm novalidate")
const expenseTableBody=document.getElementById("expenseTableBody");
const filterCategory=document.getElementById("filterCategory");
const totalAmount=document.getElementById("totalAmount");
const expenseCount=document.getElementById("expenseCount");
const highestAmount=document.getElementById("highestAmount");
const loadingSpinner=document.getElementById("loadingSpinner");
const alertContainer=document.getElementById("alertContainer");
const editForm=document.getElementById("editForm");
const editId=document.getElementById("editId");
const editTitle=document.getElementById("editTitle");
const editAmount=document.getElementById("editAmount");
const editCategory=document.getElementById("editCategory");
const editDate=document.getElementById("editDate");
const editModal=new bootstrap.Modal(document.getElementById("editModal"));

function showAlert(message, type="danger"){
    alertContainer.innerHTML=`<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message} 
    <button type="button" class="btn-close" data-bs-dismiss="alert"> </button> </div>`;

}

function showSpinner() {
    loadingSpinner.classList.remove("d-none");
}

function hideSpinner() {
    loadingSpinner.classList.add("d-none");
}

async function loadExpenses(){
    showSpinner();
    try {
        const response=await fetch(API_URL);
        if(!response.ok) {
            throw new Error("Couldnt load expenses.");
        }
        expenses=await response.json();
        updateSummary();
        displayExpenses();
    }catch(error) {
        showAlert("Couldnt connect to the server. Please make sure the server is running");
    } finally {
        hideSpinner();
    }

}

function updateSummary() {
    const total=expenses.reduce((sum,expense)=>sum+Number(expense.amount),0);
    const count=expenses.length;
    let highest=0;
    if(expenses.length>0) {
        highest=Math.max(...expenses.map(expense=>Number(expense.amount)));
    }
    totalAmount.textContent=`${total.toFixed(2)}JD`;
    expenseCount.textContent=count;
    highestAmount.textContent=`${highest.toFixed(2)}JD`;
}

function displayExpenses(){
    const selectedCategory=filterCategory.value;
    let filteredExpenses=expenses;
    if(selectedCategory !== "All"){
        filteredExpenses=expenses.filter(expense =>expense.category===selectedCategory);
    }
    expenseTableBody.innerHTML="";
    if(filteredExpenses.length===0) {
        expenseTableBody.innerHTML=`
        <tr>
        <td colspan="5" class="text-center text-muted py-4">No expenses found </td> </tr>
        `;
        return;
    }
    filteredExpenses.forEach(expense=> {
        const row=document.createElement("tr");
        row.innerHTML=`<td>${escapeHtml(expense.title)}</td>
        <td> ${Number(expense.amount).toFixed(2)}JD </td>
        <td> <span class="badge category-badge ${getCategoryClass(expense.category)}"> 
        ${expense.category} </span> </td> 
        <td> ${expense.date} </td> 
        <td> <div class="action-buttons"> 
        <button class="btn btn-sm btn-warning" onclick="openEditModal(${expense.id})">
        Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})"> Delete </button>
        </div> </td> `;
        expenseTableBody.appendChild(row);
    });
}


function getCategoryClass(category){
    if(category==="Food"){
        return "text-bg-success";
    }
    if(category==="Transport"){
        return "text-bg-primary";
    }
    if(category==="Bills"){
        return "text-bg-danger";
    }
    if(category==="Entertainment") {
        return "text-bg-warning";
    }
    return "text-bg-secondary";
}


function escapeHtml(text) {
    const div=document.createElement("div");
    div.textContent=text;
    return div.innerHTML;
}

expenseForm.addEventListener("submit",async function(event){
event.preventDefault();
clearAddErrors();
const title=document.getElementById("title").value.trim();
const amount =Number (document.getElementById("amount").value);
const category=document.getElementById("category").value;
const date=document.getElementById("date").value;
let valid=true;
if(title===""){
    document.getElementById("titleError").textContent="Title is required.";
    valid=false;
}
if(!amount || amount<=0) {
    document.getElementById("amountError").textContent="Amount must be greater than 0.";
    valid=false;
}
if(category===""){
    document.getElementById("categoryError").textContent="Please select a category.";
    valid=false;
}
if(date===""){
    document.getElementById("dateError").textContent="Date is required";
    valid=false;
}
if(!valid) {
    return;
}
try {
    const response=await fetch(API_URL,{ 
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body:JSON.stringify({title:title,amount:amount,category:category,date:date})
    });
    const data=await response.json();
    if(!response.ok){
        throw new Error ( 
            data.message || "Could not add expense."
        );
    }
    expenseForm.reset();
    showAlert("Expense added successfully.","success");
    await loadExpenses();
} catch (error) {
    showAlert(error.message);
}
});

function clearAddErrors () {
    document.getElementById("titleError").textContent=""
    document.getElementById("amountError").textContent = "";
    document.getElementById("categoryError").textContent = "";
    document.getElementById("dateError").textContent = "";
}

filterCategory.addEventListener("change",function() {
    displayExpenses();
});

function openEditModal(id) {
    const expense=expenses.find(
        expense=>expense.id===id
    );
    if(!expense) {
        return;
    }
    editId.value=expense.id;
    editTitle.value = expense.title;
    editAmount.value = expense.amount;
    editCategory.value = expense.category;
    editDate.value = convertDateForInput(expense.date);
    clearEditErrors();
    editModal.show();
}

function convertDateForInput(date){
    const parts=date.split("-");
    if(parts.length!==3){
        return "";
    }
    const day=parts[0];
    const month=parts[1];
    const year=parts[2];
    return `${year}-${month}-${day}`;
}

editForm.addEventListener("submit",async function(event) {
    event.preventDefault();
    clearEditErrors();
    const id=editId.value;
    const title=editTitle.value.trim();
    const amount=Number(editAmount.value);
    const category=editCategory.value;
    const date=editDate.value;
    let valid=true;
    if(title===""){
        document.getElementById("editTitleError").textContent="Title is required";
        valid=false;
    }
    if(!amount ||amount<=0){
        document.getElementById("editAmountError").textContent="Amount must be greater than 0.";
        valid=false;
    }
if (date===""){
    document.getElementById("editDateError").textContent="Date is required."
    valid=false;
}
if(!valid){
    return;
}
try {
    const response=await fetch(`${API_URL}/${id}`, {
        method:"PUT",
        headers: {"Content-Type":"application/json"},
        body:JSON.stringify({
            title:title,
            amount:amount,
            category:category,
            date:date
        })
    
    }
);
const data=await response.json();
if(!response.ok){
    throw new Error(
    data.message || "Could not update expense."
);
}

editModal.hide();
showAlert("Expense updated successfully.","success");
await loadExpenses();
}catch (error){
    showAlert(error.message);
}
});
function clearEditErrors() {
    document.getElementById("editTitleError").textContent = "";
    document.getElementById("editAmountError").textContent = "";
    document.getElementById("editDateError").textContent = "";
}


async function deleteExpense(id) {
    const confirmed=confirm("Are you sure u want delete this expense ??");
    if(!confirmed){
        return;
    }
    try {
        const response=await fetch(`${API_URL}/${id}`,{
            method:"DELETE"
        });
        const data=await response.json();
        if(!response.ok){
            throw new Error(data.message || "Could not delete expense");
        }
        showAlert("Expense deleted successfully.","success");
        await loadExpenses();

    }catch (error) {
        showAlert(error.message);
    }
}
loadExpenses();
