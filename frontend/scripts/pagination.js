function addPaginationNav(navId, currentPage, totalPages, passedFunction) {
  // agr pahle se pagination ul hoga to usko hta denge
  document.getElementById("paginationUL")?.remove();

  // get Pagination Navbar
  const paginationNav = document.getElementById(`${navId}`);
  // Create ul
  const ul = document.createElement("ul");
  ul.id = "paginationUL";
  ul.className = "pagination";
  // Previous Button
  const prevLi = document.createElement("li");
  const prevA = document.createElement("a");
  prevLi.setAttribute("class", "page-item");
  prevA.setAttribute("class", "page-link");
  
  currentPage === 1
    ? prevA.setAttribute("class", "page-link disabledPage")
    : null;
  prevA.appendChild(document.createTextNode("<"));
  prevLi.appendChild(prevA);
  ul.appendChild(prevLi);
  prevLi.addEventListener("click", () => {
    if (currentPage > 1) passedFunction(currentPage - 1);
  });

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    li.setAttribute("class", "page-item");
    a.setAttribute("class", "page-link");
    i === currentPage ? a.setAttribute("class", "page-link activePage") : null;
    
    a.appendChild(document.createTextNode(i));
    li.appendChild(a);
    ul.appendChild(li);
    a.addEventListener("click", () => passedFunction(i));
  }
  // Next Button
  const nextLi = document.createElement("li");
  const nextA = document.createElement("a");
  nextLi.setAttribute("class", "page-item");
  nextA.setAttribute("class", "page-link");
  
  currentPage === totalPages
    ? nextA.setAttribute("class", "page-link disabledPage")
    : null;
  nextA.appendChild(document.createTextNode(">"));
  nextLi.appendChild(nextA);
  ul.appendChild(nextLi);
  nextLi.addEventListener("click", () => {
    if (currentPage < totalPages) passedFunction(currentPage + 1);
  });
  // Append ul
  paginationNav.appendChild(ul);
}
