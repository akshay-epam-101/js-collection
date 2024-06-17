
export enum LoopControl {
    break='___BREAK__LOOP', continue='___CONTINUE__LOOP'
}
export enum LoopOrder {
    normal='N', reverse='R'
}

export class List<T=any> {
    readonly #list: Array<T> = new Array(0);
    public length = 0;

    public isEmpty() {
        return this.#list.length === 0;
    }
    public add(...elem: T[]): void {
        this.#list.push(...elem);
        this.length = this.#list.length;
    }
    public get(index: number): T {
        return this.#list[index];
    }
    public insert(index: number, ...elem: T[]): void {
        this.#list.splice(index, 0, ...elem);
        this.length = this.#list.length;
    }
    public remove(index: number, deleteCount?: number): void {
        this.#list.splice(index, deleteCount || 1);
        this.length -= deleteCount || 1;
    }
    public replace(index: number, newElement: T): void {
        this.#list.splice(index, 1, newElement);
    }
    #normalForLoop(callbackfn: (value: T, index: number) => void | LoopControl) {
        for(let i = 0, l = this.length; i<l; i++) {
            if(callbackfn(this.#list[i], i) === LoopControl.break) break;
        }
    }
    #reverseForLoop(callbackfn: (value: T, index: number) => void | LoopControl) {
        for(let i = this.length - 1; i>=0; i--) {
            if(callbackfn(this.#list[i], i) === LoopControl.break) break;
        }
    }
    public forEach(callbackfn: (value: T, index: number) => void | LoopControl, order?: LoopOrder): void {
        (order === LoopOrder.reverse) ? this.#reverseForLoop(callbackfn) : this.#normalForLoop(callbackfn);
    }
    public map<U>(callbackfn: (value: T, index: number) => U | undefined, order?: LoopOrder): List<U> {
        const newList = new List<U>();
        if(order === LoopOrder.reverse) {
            for(let i = this.length - 1, cbr: U | undefined; i>=0; i--) {
                cbr = callbackfn(this.#list[i], i);
                if(cbr !== undefined) newList.add(cbr);
            }
            return newList;
        }
        for(let i = 0, l = this.length, cbr: U | undefined; i<l; i++) {
            cbr = callbackfn(this.#list[i], i);
            if(cbr !== undefined) newList.add(cbr);
        }
        return newList;
    }
    public reduce<U>(callbackfn: (accumulator: U, value: T, index: number) => U, initialValue: U, order?: LoopOrder): U {
        if(order === LoopOrder.reverse) {
            for(let i = this.length - 1; i>=0; i--) {
                initialValue = callbackfn(initialValue, this.#list[i], i);
            }
            return initialValue;
        }
        for(let i = 0, l = this.length; i<l; i++) {
            initialValue = callbackfn(initialValue, this.#list[i], i);
        }
        return initialValue;
    }
    public filter(predicate: (value: T, index: number) => boolean, order?: LoopOrder): List<T> {
        return this.map((v, i) => (predicate(v, i) ? v : undefined), order);
    }
    public find(predicate: (value: T, index: number) => boolean, order?: LoopOrder): T | undefined {
        let foundItem: T | undefined = undefined;
        this.forEach((v, i) => {
            if(predicate(v, i)) {
                foundItem = v;
                return LoopControl.break;
            }
        }, order);
        return foundItem;
    }
    public findIndex(predicate: (value: T, index: number) => boolean, order?: LoopOrder): number {
        let foundIndex: number = -1;
        this.forEach((v, i) => {
            if(predicate(v, i)) {
                foundIndex = i;
                return LoopControl.break;
            }
        }, order);
        return foundIndex;
    }
    public clone() {
        const newList = new List<T>();
        let index = 0, len = this.length;
        while(index<len) {
            newList.add(this.#list[index]);
            index++;
        }
        return newList;
    }
    public concat(anotherList: List<T>) {
        const newList = this.clone();
        anotherList.forEach(v => newList.add(v));
        return newList;
    }
    public toString(): string {
        let res = '';
        for(let i = 0, l = this.length; i<l; i++) {
            res += `${this.#list[i]},`;
        }
        return res.substring(0, res.length-1);
    }
    public *[Symbol.iterator](): IterableIterator<T> {
        let index = 0, len = this.length;
        while(index<len) {
            yield this.#list[index++];
        }
    }
}

export class ListNode<T> {
    prev: ListNode<T> | undefined;
    next: ListNode<T> | undefined;
    value: T;
    constructor(value: T, next?: ListNode<T>, prev?: ListNode<T>) {
        this.setValue(value);
        if(next) this.setNext(next);
        if(prev) this.setPrev(prev);
    }
    setNext(next?: ListNode<T>) {
        this.next = next;
    }
    setPrev(prev?: ListNode<T>) {
        this.prev = prev;
    }
    setValue(value: T) {
        this.value = value;
    }
}
export class LinkedList<T=any> {
    #head: ListNode<T> | undefined;
    #tail: ListNode<T> | undefined;

    public length = 0;

    #elementsToNodes(...elem: T[]) {
        let i = 0, length = elem.length, node: ListNode<T>;
        let head: ListNode<T>, tail: ListNode<T>;
        while(i<length) {
            node = new ListNode(elem[i++]);
            if(!tail) head = tail = node;
            else {
                tail.setNext(node);
                node.setPrev(tail);
                tail = tail.next;
            }
        }
        return {head, tail, length};
    }
    #findNode(index: number) {
        if(index>=this.length || index<0) return;
        const reverse = (index>this.length/2);
        if(reverse) {
            let node = this.#tail, i = this.length-1;
            while(--i === index && node) {
                node = node.prev;
            }
            return node;

        }
        let node = this.#head;
        while(index-- && node) {
            node = node.next;
        }
        return node;
    }
    #removeRange(node: ListNode<T>, deleteCount=1) {
        const pre = node.prev;
        while(deleteCount > 0 && node.next) {
            node = node.next;
            this.length--;
            deleteCount--;
        }
        if(deleteCount>0 && !node.next) {
            node = node.next;
            this.length--;
        }
        if(pre) pre.setNext(node);
        else this.#head = node;
        if(node) node.setPrev(pre);
        else this.#tail = pre;
    }

    public isEmpty() {
        return this.length === 0;
    }
    public add(...elem: T[]) {
        const nodes = this.#elementsToNodes(...elem);
        if(this.isEmpty()) [this.#head, this.#tail, this.length] = [nodes.head, nodes.tail, nodes.length];
        else {
            this.#tail.setNext(nodes.head);
            nodes.head.setPrev(this.#tail);
            this.#tail = nodes.tail;
            this.length += nodes.length;
        }
    }
    public get(index: number) {
        const node = this.#findNode(index);
        if(node) return node.value;
    }
    public insert(index: number, ...elem: T[]): void {
        if(index<0 || index>this.length) return;
        if(index === this.length) return this.add(...elem);
        const node = this.#findNode(index);
        const nodes = this.#elementsToNodes(...elem);
        const prevNode = node.prev;
        prevNode.setNext(nodes.head);
        nodes.head.setPrev(prevNode);
        nodes.tail.setNext(node);
        node.setPrev(nodes.tail);
        this.length += nodes.length;
    }
    public remove(index: number, deleteCount?: number): void {
        let node = this.#findNode(index);
        if(node) this.#removeRange(node, deleteCount || 1);
    }
    public replace(index: number, newElement: T): void {
        const node = this.#findNode(index);
        node.setValue(newElement);
    }
    #normalForLoop(callbackfn: (value: T, index: number) => void | LoopControl) {
        let node: ListNode<T> = this.#head, index = 0;
        while(node) {
            callbackfn(node.value, index);
            node = node.next;
            index++
        }
    }
    #reverseForLoop(callbackfn: (value: T, index: number) => void | LoopControl) {
        let node: ListNode<T> = this.#tail, index = this.length - 1;
        while(node) {
            callbackfn(node.value, index);
            node = node.prev;
            index--
        }
    }
    public forEach(callbackfn: (value: T, index: number) => void, order?: LoopOrder): void {
        (order === LoopOrder.reverse) ? this.#reverseForLoop(callbackfn) : this.#normalForLoop(callbackfn);
    }
    public map<U>(callbackfn: (value: T, index: number) => U, order?: LoopOrder): LinkedList<U> {
        const newList = new LinkedList<U>();
        let node: ListNode<T>, index: number, cbr: U;
        if(order === LoopOrder.reverse) {
            node = this.#tail, index = this.length - 1;
            while(node) {
                cbr = callbackfn(node.value, index);
                if(cbr !== undefined) newList.add(cbr);
                node = node.prev;
                index--;
            }
            return newList;
        }
        node = this.#head, index = 0;
        while(node) {
            cbr = callbackfn(node.value, index);
            if(cbr !== undefined) newList.add(cbr);
            node = node.next;
            index++;
        }
        return newList;
    }
    public reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, order?: LoopOrder): U {
        let node: ListNode<T>, index: number;
        if(order === LoopOrder.reverse) {
            node = this.#tail, index = this.length - 1;
            while(node) {
                initialValue = callbackfn(initialValue, node.value, index);
                node = node.prev;
                index--;
            }
            return initialValue;
        }
        node = this.#head, index = 0;
        while(node) {
            initialValue = callbackfn(initialValue, node.value, index);
            node = node.next;
            index++;
        }
        return initialValue;
    }
    public filter(predicate: (value: T, index: number) => boolean, order?: LoopOrder): LinkedList<T> {
        return this.map((v, i) => (predicate(v, i) ? v : undefined), order);
    }
    public find(predicate: (value: T, index: number) => boolean, order?: LoopOrder): T | undefined {
        let foundItem: T;
        this.forEach((v, i) => {
            if(predicate(v, i)) {
                foundItem = v;
                return LoopControl.break;
            }
        }, order);
        return foundItem;
    }
    public findIndex(predicate: (value: T, index: number) => boolean, order?: LoopOrder): number {
        let foundIndex: number = -1;
        this.forEach((v, i) => {
            if(predicate(v, i)) {
                foundIndex = i;
                return LoopControl.break;
            }
        }, order);
        return foundIndex;
    }
    public clone() {
        const newList = new LinkedList<T>();
        let node = this.#head, index = 0;
        while(node) {
            newList.add(node.value);
            node = node.next;
            index++;
        }
        return newList;
    }
    public concat(anotherList: LinkedList<T>) {
        const nl = this.clone();
        anotherList.forEach(v => nl.add(v));
        return nl;
    }
    public toString() {
        let node = this.#head;
        if(!node) return '';
        let res = `${node.value}`;
        while(node.next) {
            node = node.next;
            res += `,${node.value}`
        }
        return res;
    }
    public *[Symbol.iterator](): IterableIterator<T> {
        let node = this.#head;
        while(node) {
            yield node.value;
            node = node.next;
        }
    }
}

export class Stack<T=any> {
    #head: ListNode<T> | undefined;

    public isEmpty() {
        return !this.#head;
    }
    public push(item: T) {
        if(!this.#head) this.#head = new ListNode(item);
        else {
            let node = new ListNode(item);
            node.next = this.#head;
            this.#head = node;
        }
    }
    public peek() {
        if(this.#head) return this.#head.value;
    }
    public pop() {
        if(this.#head) {
            let node = this.#head;
            this.#head = this.#head.next;
            return node.value;
        }
    }
}