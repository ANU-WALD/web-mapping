import { Injectable } from '@angular/core';
import { TreeModel } from './data/tree';

@Injectable()
export class TreeFilterService {

  constructor() {
  }

  filterTree(tree: TreeModel, filterText: string) {

    tree.visible = false;

    filterText = filterText.trim().toLowerCase();

    const containsFilterText = (label: string, filterText: string) => label.trim().toLowerCase().indexOf(filterText) !== -1;

    tree.visible = containsFilterText(tree.label, filterText);

    if (tree.hasOwnProperty("children")) {
      if(tree.visible){
        tree.children.forEach(child=>this.showAll(child));
      } else {
        tree.children.map(child => {
          this.filterTree(child, filterText);

          tree.visible = tree.visible || child.visible;
          tree.expanded = tree.expanded || child.visible || child.expanded;
        });
      }
    }

    return tree;

  }

  showAll(tree:TreeModel){
    tree.visible=true;
    if (tree.hasOwnProperty("children")) {
      tree.children.forEach(c=>this.showAll(c));
    }
  }
}
