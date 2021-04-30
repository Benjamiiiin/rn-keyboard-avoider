import React, { MutableRefObject, useRef, useState } from 'react';


export class RefObj<T> {
  trueRef: MutableRefObject<T>;

  constructor (initRef?: MutableRefObject<T>) {
    this.trueRef = initRef ?? React.createRef<T>() as MutableRefObject<T>;
  }
  
  get cur(): T {
    return this.trueRef.current as T;
  }

  set cur(value: T) {
    this.trueRef.current = value;
  }
}


export class StateObj<T> {
  ref: RefObj<T>;
  setRef: (newState: T) => void;

  constructor (ref: RefObj<T>, setRef: (newState: T) => void) {
    this.ref = ref;
    this.setRef = setRef;
  }

  /** Access state value. */
  get val(): T {
    return this.ref.cur as T;
  }

  set = (value: T) => {
    this.setRef(value);
  }
}


export function useReff<T>(initValue: T): RefObj<T> {
  const ref = useRef<T>(initValue);
  return new RefObj<T>(ref);
}


export function useAsyncReff<T>(value: T): [RefObj<T>, (newState: T) => void] {
  const ref = useReff<T>(value);
  const [, forceRender] = useState<boolean>(false);

  function updateState(newState: T) {
    ref.cur = newState;
    forceRender(s => !s);
  };

  return [ref, updateState];
}


export function useStatee<T>(value: T): StateObj<T> {
  const [ref, setRef] = useAsyncReff<T>(value);
  return new StateObj<T>(ref, setRef);
}