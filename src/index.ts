import { Stack } from "./list";

const stack = new Stack<string>();
console.log(stack.isEmpty());
console.log(stack.peek());
console.log(stack.pop());
stack.push('a');
console.log(stack.isEmpty());
stack.push('b')
stack.push('c')
stack.push('d')
console.log(stack.isEmpty());
console.log(stack.pop());
console.log(stack.pop());
console.log(stack.peek());
console.log(stack.pop());
console.log(stack.pop());
console.log(stack.isEmpty());

 