<script>
  import { actionsStore, addAction, updateAction, deleteAction } from '$lib/stores/actions';

  let actions = [];
  let newAction = '';
  let editIndex = -1;
  let editValue = '';

  // Subscribe to the actions store
  const unsubscribe = actionsStore.subscribe(value => {
    actions = value;
  });

  // Clean up the subscription when the component is destroyed
  onDestroy(() => {
    unsubscribe();
  });

  function handleAddAction() {
    if (newAction.trim() !== '') {
      addAction(newAction);
      newAction = '';
    }
  }

  function handleEditAction(index) {
    editIndex = index;
    editValue = actions[index];
  }

  function handleSaveEdit() {
    updateAction(editIndex, editValue);
    editIndex = -1;
    editValue = '';
  }

  function handleDeleteAction(index) {
    deleteAction(index);
  }
</script>

<main class="uk-container">
  <h1 class="uk-heading-line"><span>Actions List</span></h1>
  
  <!-- Add new action -->
  <div class="uk-margin">
    <input class="uk-input uk-form-width-medium" type="text" bind:value={newAction} placeholder="New Action" />
    <button class="uk-button uk-button-primary" on:click={handleAddAction}>Add</button>
  </div>

  <!-- List actions with edit and delete functionality -->
  <table class="uk-table uk-table-divider uk-table-hover">
    <thead>
      <tr>
        <th>Action</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each actions as action, index}
        <tr>
          <td>
            {#if editIndex === index}
              <input class="uk-input" type="text" bind:value={editValue} />
            {:else}
              {action}
            {/if}
          </td>
          <td>
            {#if editIndex === index}
              <button class="uk-button uk-button-primary uk-button-small" on:click={handleSaveEdit}>Save</button>
              <button class="uk-button uk-button-default uk-button-small" on:click={() => { editIndex = -1; editValue = ''; }}>Cancel</button>
            {:else}
              <button class="uk-button uk-button-default uk-button-small" on:click={() => handleEditAction(index)}>Edit</button>
              <button class="uk-button uk-button-danger uk-button-small" on:click={() => handleDeleteAction(index)}>Delete</button>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>

<style>
  main {
    font-family: Arial, sans-serif;
    padding: 1rem;
  }
  h1 {
    color: #333;
  }
  .uk-margin {
    margin-bottom: 1rem;
  }
</style>