import request from "./main.js";
import { LIMIT } from "./const.js";

const categoriesRow = document.querySelector(".categories-row");
const categorySearchInput = document.querySelector(".category-search-input input");
const categoriesCount = document.querySelector(".categories-count");
const pagination = document.querySelector(".pagination");
const teachersForm = document.querySelector(".student-form");
const teachersModal = document.querySelector("#teachersModal");
const addCategoryBtn = document.querySelector(".add-category-btn");
const addSaveCategoryBtn = document.querySelector(".add-save-category-btn");
const firstNameInp = document.querySelector('.first-name') 
const lastNameInp = document.querySelector('.last-name') 
const avatarInp = document.querySelector('.avatar-inp') 
const groupsInp = document.querySelector('.groups-inp') 
const phoneInp = document.querySelector('.phone-inp') 
const emailInp = document.querySelector('.email-inp') 
const marriedInp = document.querySelector('.married-inp')
const marriedFilter = document.querySelector('.form-select-pos') 
const nameFilter = document.querySelector('.form-select-teach') 


let search = "";
let activePage = 1;
let selected = null;
let Married = "";
let name = "";


function getCategoryCard({ avatar , firstName, lastName, email, phoneNumber, isMarried, groups, id }) {
  return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
      <div class="card">
        <img src="${avatar}" class="card-img-top" alt="..." />
        <div class="card-body">
          <div class="card-names d-flex align-items-center gap-2">
            <h3 class="card-name">${firstName}</h3>
            <h3 class="card-last">${lastName}</h3>
          </div>
          <p class="card-email">${email}</p>
          <p class="card-number">${phoneNumber.split("x")[0]}</p>
          <p class="card-groups">Groups: ${groups}</p>
          <p class="card-married">isMarried: ${isMarried ? "Married" : "No married"}</p>
          <div class="btns d-flex gap-2">
            <button class="btn btn-primary edit-btn" data-bs-toggle="modal" data-bs-target="#teachersModal" id="${id}">Edit</>
            <button class="btn btn-danger delete-btn" id="${id}">Delete</button>
            <a href="students.html?student=${id}" class="btn btn-success student">Students</a>
          </div>
        </div>
      </div>
    </div>
  `;
}



async function getCategories() {
  categoriesRow.append(load())
  try {
    let params = { lastName: search};
    let paramsWithPagination = { lastName: search, page: activePage, limit: LIMIT};

    // all teachers with search
    let { data } = await request.get(`teachers`, {params});
    console.log(data);
    

    // teachers with pagination
    let { data: dataWithPagination } = await request.get("teachers", {
      params: paramsWithPagination, 
    });


    if (marriedFilter.value !== "All") {
      dataWithPagination = data.filter((filters) => {
        if (marriedFilter.value !== "true") {
          return filters.isMarried === false;
        } else {
          return filters.isMarried === true;  
        }
      });
    }
    console.log(dataWithPagination);

    if (nameFilter.value !== "All") {
      dataWithPagination.sort((a, b) => {
        const nameA = a.lastName;
        const nameB = b.lastName;
    
        if (nameFilter.value === "1") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }


    // pagination
    let pages = Math.ceil(data.length / LIMIT);

    pagination.innerHTML = `
    <li class="page-item ${activePage === 1 ? "disabled" : ""}">
      <button page="-" class="page-link">Previous</button>
    </li>`;

    for (let i = 1; i <= pages; i++) {
      pagination.innerHTML += `
        <li class="page-item ${i === activePage ? "active" : ""}">
          <button page="${i}" class="page-link">${i}</button>
        </li>
      `;
    }

    pagination.innerHTML += `
    <li class="page-item ${activePage === pages ? "disabled" : ""}">
      <button page="+" class="page-link">Next</button>
    </li>`;


    categoriesCount.textContent = data.length;
    categoriesRow.innerHTML = "";
    let freePage = document.createElement('div');
    freePage.classList.add("free-page");

    if(data.length === 0){
      categoriesRow.append(freePage)
      freePage.innerHTML = "Teachers not found"
    }else{
      categoriesRow.innerHTML = "";
    }


    dataWithPagination.map((teachers) => {  
      categoriesRow.innerHTML += getCategoryCard(teachers);
    });
  } catch (err) {
    console.log(err);
  }
}

getCategories();

categorySearchInput.addEventListener("keyup", function () {
  activePage = 1
  search = this.value;
  getCategories();
});

pagination.addEventListener("click", (e) => {
  let page = e.target.getAttribute("page");
  if (page !== null) {
    if (page === "+") {
      activePage++;
    } else if (page === "-") {
      activePage--;
    } else {
      activePage = +page;
    }
    getCategories();
  }
});

teachersForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  let teachersData = {
    avatar: avatarInp.value,
    firstName: firstNameInp.value,
    lastName: lastNameInp.value,
    email: emailInp.value,
    phoneNumber: phoneInp.value,
    groups: groupsInp.value,
    isMarried: marriedInp.checked,
  };
  if (selected === null) {
    await request.post("teachers", teachersData);
  } else {
    await request.put(`teachers/${selected}`, teachersData);
  }
  getCategories();
  bootstrap.Modal.getInstance(teachersModal).hide();
});

addCategoryBtn.addEventListener("click", () => {
  selected = null;
  firstNameInp.value = "";
  lastNameInp.value = "";
  avatarInp.value = "";
  groupsInp.value = "";
  phoneInp.value = "";
  emailInp.value = "";
  marriedInp.checked = false;
  addSaveCategoryBtn.textContent = "Add teachers";
});

window.addEventListener("click", async (e) => {
  let id = e.target.getAttribute("id");

  let checkEdit = e.target.classList.contains("edit-btn");
  if (checkEdit) {
    selected = id;
    let { data } = await request.get(`teachers/${id}`);
    firstNameInp.value = data.firstName;
    lastNameInp.value = data.lastName;
    avatarInp.value = data.avatar;
    groupsInp.value = data.groups;
    phoneInp.value = data.phoneNumber.split("x")[0];
    emailInp.value = data.email;
    marriedInp.checked = data.isMarried;
    addSaveCategoryBtn.textContent = "Save teachers";
  }
  
  let checkDelete = e.target.classList.contains("delete-btn");
  if (checkDelete) {
    let deleteConfirm = confirm("Do you want to delete this teachers?");
    if (deleteConfirm) {
      await request.delete(`teachers/${id}`);
      getCategories();
    }
  }
});

marriedFilter.addEventListener("change", function () {
  Married = categorySearchInput.value;
  getCategories();
});

nameFilter.addEventListener("change", function () {
  name = categorySearchInput.value;
  getCategories();
});

function load(){
  let loader = document.createElement('span');
  loader.classList.add("loader");
  return loader;
}