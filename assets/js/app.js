let cl = console.log;

const postForm = document.getElementById("postForm");
const titleCtrl = document.getElementById("title");
const contentCtrl = document.getElementById("content");
const userIdCtrl = document.getElementById("userId");
const postContainer = document.getElementById("postContainer");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");

let baseUrl = `https://dp-angular-3aab9-default-rtdb.asia-southeast1.firebasedatabase.app/`;
let postsUrl = `${baseUrl}/posts.json`;
let singlePostUrl = `${baseUrl}/posts/:id.json`;
let updatePostUrl = `${baseUrl}/posts/:id.json`;
let deletPostUrl = `${baseUrl}/posts/:id.json`;


let postArray = [];

const objTOArray = (obj, postId) => {
    for (const key in obj) {
        let updateObj = obj[key];
        updateObj[postId] = key;
        // cl(updateObj.postId)
        postArray.unshift(updateObj)
    }
    return postArray;
}


const templating = (postArray) => {
    let result = "";
    postArray.forEach(post => {
        result +=
            `
                <div class="col-md-4 mb-4" >
                        <div class="card  mb-4"  id = "${post.postId}">
                            <div class="card-header text-center"><h3>${post.title}</h3></div>
                            <div class="card-body"><p>${post.content}</p></div>
                            <div class="card-footer d-flex justify-content-between">
                                <button class="btn btn-success" onclick="editBtn(this)">EDIT</button>
                                <button class="btn btn-danger" onclick="deletBtn(this)">DELETE</button>
                            </div>
                        </div>
                </div>   
            `
    });

    postContainer.innerHTML = result;
}

const editBtn = (ele) => {
    let editId = ele.closest(".card").id;
    let editUrl = `${baseUrl}/posts/${editId}.json`
    localStorage.setItem("editId", editId)
    makeApiCall("GET", editUrl)
        .then(res => {
            let data = JSON.parse(res);
            localStorage.setItem("editId", editId);
            titleCtrl.value = data.title;
            contentCtrl.value = data.content;
            userIdCtrl.value = data.userId;
            submitBtn.classList.add("d-none");
            updateBtn.classList.remove("d-none");
        })
        .catch(err => cl(err));
}

const deletBtn = (ele) => {
    let deleteId = ele.closest(".card").id;
    let deleteURL = `${baseUrl}/posts/${deleteId}.json`

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            makeApiCall("DELETE", deleteURL)
                .then(res => {
                    cl(res)
                    document.getElementById(deleteId).remove()
                })
                .catch(err => {
                    cl(err)
                })
        }
    })



}



const makeApiCall = (methodName, apiUrl, msgBody = null) => {
    let promise = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(methodName, apiUrl);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.response);
            }
        }
        xhr.send(msgBody);
    })
    return promise;
}

const getPost = () => {
    makeApiCall("GET", postsUrl)
        .then(res => {
            let data = JSON.parse(res);
            cl(data)
            let postArray = objTOArray(data, "postId");
            templating(postArray)
        })
        .catch(res => cl(res))
}

getPost();

const onPostSubmit = (eve) => {
    eve.preventDefault();
    let postObj = {
        title: titleCtrl.value,
        content: contentCtrl.value,
        userId: userIdCtrl.value
    }
    postArray.unshift(postObj)

    Swal.fire({
        title: 'Do you want to save the post?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Save',
        denyButtonText: `Don't save`,
    }).then((result) => {

        if (result.isConfirmed) {
            makeApiCall("POST", postsUrl, JSON.stringify(postObj))
                .then(res => {
                    let resData = JSON.parse(res)
                    let card = document.createElement("div")
                    card.className = "card mb-4"
                    card.id = resData.name
                    card.innerHTML = `
                                     
    
                                            
                                                <div class="card-header text-center"><h3>${postObj.title}</h3></div>
                                                <div class="card-body"><p>${postObj.content}</p></div>
                                                <div class="card-footer d-flex justify-content-between">
                                                    <button class="btn btn-success" onclick="editBtn(this)">EDIT</button>
                                                    <button class="btn btn-danger" onclick="deletBtn(this)">DELETE</button>
                                                </div>
                                            
                                      
                                `
                    postContainer.prepend(card)

                    // templating(postArray)
                })
                .catch(err => cl(err))
                .finally(postForm.reset())
        } else if (result.isDenied) {
            Swal.fire('Post not saved', '', 'info')
        }
    })


}

const onPostUpdate = () => {
    let updateId = localStorage.getItem("editId")
    localStorage.removeItem("editId")
    let updatePost = {
        title: titleCtrl.value,
        content: contentCtrl.value,
        userId: userIdCtrl.value
    }
    let updateUrl = `${baseUrl}/posts/${updateId}.json`
    Swal.fire({
        title: 'Do you want to save the changes?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Save',
        denyButtonText: `Don't save`,
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            makeApiCall("PATCH", updateUrl, JSON.stringify(updatePost))
                .then(res => {
                    cl(res)
                    let data = JSON.parse(res)
                    let card = [...document.getElementById(updateId).children]
                    cl(card)
                    card[0].innerHTML = `<h3>${data.title}</h3>`
                    card[1].innerHTML = `${data.content}`
                    submitBtn.classList.remove("d-none");
                    updateBtn.classList.add("d-none");
                })
                .catch(err => {
                    cl(err)
                })
                .finally(() => {
                    postForm.reset()
                })
        } else if (result.isDenied) {
            Swal.fire('Changes are not saved', '', 'info')
        }
    })

}

updateBtn.addEventListener("click", onPostUpdate)
postForm.addEventListener("submit", onPostSubmit)

