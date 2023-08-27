import request from "./main.js";

const studentsAdd = new URLSearchParams(location.search)
const studentId = studentsAdd.get('student')


const categoriesRow = document.querySelector(".categories-row");
const categorySearchInput = document.querySelector(".category-search-input input");
const categoriesCount = document.querySelector(".categories-count");  
const studentsForm = document.querySelector(".student-form");
const teachersModal = document.querySelector("#teachersModal");
const addCategoryBtn = document.querySelector(".add-category-btn");
const addSaveCategoryBtn = document.querySelector(".add-save-category-btn");
const firstNameInp = document.querySelector('.first-name') 
const lastNameInp = document.querySelector('.last-name') 
const avatarInp = document.querySelector('.avatar-inp') 
const birthdayInp = document.querySelector('.birthday-inp') 
const fieldInp = document.querySelector('.field-inp') 
const phoneInp = document.querySelector('.phone-inp') 
const emailInp = document.querySelector('.email-inp') 
const workInp = document.querySelector('.work-inp')
const teacherInp = document.querySelector('.form-select-teach')
const birthSort = document.querySelector('.form-select-pos')

let search = "";
let selected = null;
let birth = "";

function getCategoryCard({ avatar , firstName, lastName, email, phoneNumber, isWork, birthday, id }) {
  return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
      <div class="card">
        <img src="${avatar}" class="card-img-top" alt="..." />
        <div class="card-body">
          <div class="card-names d-flex align-items-center gap-2">
            <h3 class="card-name">${firstName}</h3>
            <h3 class="card-last">${lastName}</h3>
          </div>
          <p class="card-groups">${birthday.split("T")[0]}</p>
          <p class="card-email">${email}</p>
          <p class="card-number">${phoneNumber.split("x")[0]}</p>
          <p class="card-married">isWork: ${isWork ? "Work" : "Desn't Work"}</p>
          <div class="btns d-flex gap-2">
            <button class="btn btn-primary edit-btn" data-bs-toggle="modal" data-bs-target="#teachersModal" id="${id}">Edit</>
            <button class="btn btn-danger delete-btn" id="${id}">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function getCategories() {
  categoriesRow.append(load())
  try {
    let params = { firstName: search };

    // all students with search
    let { data } = await request.get(`teachers/${studentId}/student`, { params });

    categoriesCount.textContent = data.length;
    categoriesRow.innerHTML = "";
    let freePage = document.createElement('div');
    freePage.classList.add("free-page");

    if(data.length === 0){
      categoriesRow.append(freePage)
      freePage.innerHTML = "Students not found"
    }else{
      categoriesRow.innerHTML = "";
    }

    if (birthSort.value !== "All") {
      data.sort((a, b) => {
        const nameA = a.birthday;
        const nameB = b.birthday;
    
        if (birthSort.value === "true") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }

    let filterTeachersData = await request.get('teachers', {params})
      filterTeachersData.data.map((el) => {
      teacherInp.innerHTML += `
        <option value="${el.id}">${el.firstName}</option>
  `
  })

    data.map((student) => {
      categoriesRow.innerHTML += getCategoryCard(student);
    });
  } catch (err) {
    console.log(err);
  }
}

getCategories();

categorySearchInput.addEventListener("keyup", function () {
  search = this.value;
  console.log(search);
  getCategories();
});


studentsForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  let studentData = {
    avatar: avatarInp.value,
    firstName: firstNameInp.value,
    lastName: lastNameInp.value,
    email: emailInp.value,
    phoneNumber: phoneInp.value,
    birthday: birthdayInp.value,
    isWork: workInp.checked,
  };
  if (selected === null) {
    await request.post(`/teachers/${studentId}/student`, studentData);
  } else {
    await request.put(`teachers/${studentId}/student/${selected}`, studentData);
  }
  getCategories();
  bootstrap.Modal.getInstance(teachersModal).hide();
});

addCategoryBtn.addEventListener("click", () => { 
  selected = null;
  firstNameInp.value = "";
  lastNameInp.value = "";
  avatarInp.value = "";
  phoneInp.value = "";
  emailInp.value = "";
  fieldInp.value = ""; 
  birthdayInp.value = "";
  workInp.checked = false;
  addSaveCategoryBtn.textContent = "Add students";
});

window.addEventListener("click", async (e) => {
  let id = e.target.getAttribute("id");

  let checkEdit = e.target.classList.contains("edit-btn");
  if (checkEdit) {
    selected = id;
    let { data } = await request.get(`teachers/${studentId}/student/${selected}`);
    firstNameInp.value = data.firstName;
    lastNameInp.value = data.lastName;
    avatarInp.value = data.avatar;
    birthdayInp.value = data.birthday.split("T")[0];
    phoneInp.value = data.phoneNumber.split("x")[0];
    fieldInp.value = data.field;
    emailInp.value = data.email;
    workInp.checked = data.isWork;
    addSaveCategoryBtn.textContent = "Save students";
  }
  
  let checkDelete = e.target.classList.contains("delete-btn");
  if (checkDelete) {
    let deleteConfirm = confirm("Do you want to delete this student?");
    if (deleteConfirm) {
      await request.delete(`teachers/${studentId}/student/${id}`);
      getCategories();
    }
  }
});


birthSort.addEventListener("change", function () {
  birth = categorySearchInput.value;
  getCategories();
});

function load(){
  let loader = document.createElement('span');
  loader.classList.add("loader");
  return loader;
}