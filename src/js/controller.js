import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

const { Record } = require('immutable');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    //update results to make selected result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    //loading recipe
    await model.loadRecipe(id);

    //rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    // alert(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //get search query
    const query = searchView.getQuery();

    // if (!query) return;

    //load serach query
    await model.loadSearchResults(query);

    //render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (gotoPage) {
  //render NEW results
  resultsView.render(model.getSearchResultsPage(gotoPage));

  // render initial pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServing) {
  //update the recipe servings ( in state)
  model.updateServings(newServing);

  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //Add/remove bookmarks
  if (!model.state.recipe.bookmarked) {
    model.AddBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  //update recipe view
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlRecipeUpload = async function (newRecipe) {
  try {
    // add load spinner
    addRecipeView.renderSpinner();

    //UPLOAD NEW RECIPE DATA
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //RENDER RECIPE
    recipeView.render(model.state.recipe);

    //display success message
    addRecipeView.renderMessage();

    //render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change the ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('❌', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdatingServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addhandlerSearch(controlSearchResults);
  addRecipeView.addhandlerUpload(controlRecipeUpload);
  paginationView.addhandlerClick(controlPagination);
};
init();
