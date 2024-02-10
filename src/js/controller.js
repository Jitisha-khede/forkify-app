import * as model from './model.js';
import {MODAL_CLOSE_SEC} from './config.js';
import recipeView from './view/recipeView.js';
import resultsView from './view/resultsView.js';
import bookmarksView from './view/bookmarksView.js';
import searchView from './view/searchView.js';
import paginationView from './view/paginationView.js';
import addRecipeView from './view/addRecipeView.js';
import 'core-js/stable'
import 'regenerator-runtime'
import { MODAL_CLOSE_SEC } from './config.js';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

if(module.hot){
  module.hot.accept();
}

const controlRecipes = async function(){
  try {
    
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    //recipe loading
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    await model.loadRecipe(id);
    //rendering recipe
    recipeView.render(model.state.recipe);  
  } 
  catch(err){
    //console.log(err);
    recipeView.renderError();
  }
}

const controlSearchResults = async function(){
  try{
    resultsView.renderSpinner();
    //1) get search query 
    const query = searchView.getQuery();
    
    if(!query)  return;
    //2) load search result
    await model.loadSearchResult(query);
    //3) Render results
    
    //resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);
  }
  catch(err){
    console.log(err);
  }
}

const controlPagination = function(goToPage){
  resultsView.render(model.getSearchResultsPage(goToPage));

  paginationView.render(model.state.search);
}

const controlServings = function(newServings){
  model.updateServings(newServings);
  //  recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function(){
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //console.log(model.state.recipe);
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe){
  try{
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();
    bookmarksView.render(model.state.bookmarks);
    window.history.pushState(null,'',`#${model.state.recipe.id}`);

    setTimeout(function(){
      addRecipeView.toggleWindow();
    },MODAL_CLOSE_SEC*1000);
    
  }

  
  catch(err){
    console.error(err);
    addRecipeView.renderError(err.message);
  }
}

const init =  function(){
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
}
init();

// window.addEventListener('load',controlRecipes);
// window.addEventListener('hashchange',controlRecipes);