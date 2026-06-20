/**
 * DSA Implementations for NextGen Health
 * 
 * This file contains Data Structure implementations used throughout the application:
 * 1. Priority Queue (Min-Heap) - For patient queue management
 * 2. Trie - For drug name autocomplete
 * 3. LRU Cache - For caching frequently accessed data
 * 4. Graph - For doctor recommendation system
 */

// ============================
// 1. PRIORITY QUEUE (MIN-HEAP)
// ============================
// Used for: Smart patient queue with priority handling

interface QueueItem {
    patientId: string;
    patientName: string;
    priority: number; // Lower = Higher priority
    tokenNumber: number;
    type: 'EMERGENCY' | 'REGULAR';
    timestamp: number;
}

export class PriorityQueue<T extends { priority: number }> {
    private heap: T[] = [];

    // Get parent index
    private parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    // Get left child index
    private leftChild(i: number): number {
        return 2 * i + 1;
    }

    // Get right child index
    private rightChild(i: number): number {
        return 2 * i + 2;
    }

    // Swap two elements
    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Heapify up (after insertion)
    private heapifyUp(i: number): void {
        while (i > 0 && this.heap[this.parent(i)].priority > this.heap[i].priority) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    // Heapify down (after extraction)
    private heapifyDown(i: number): void {
        let minIndex = i;
        const left = this.leftChild(i);
        const right = this.rightChild(i);

        if (left < this.heap.length && this.heap[left].priority < this.heap[minIndex].priority) {
            minIndex = left;
        }

        if (right < this.heap.length && this.heap[right].priority < this.heap[minIndex].priority) {
            minIndex = right;
        }

        if (minIndex !== i) {
            this.swap(i, minIndex);
            this.heapifyDown(minIndex);
        }
    }

    // Insert element - O(log n)
    enqueue(item: T): void {
        this.heap.push(item);
        this.heapifyUp(this.heap.length - 1);
    }

    // Extract minimum (highest priority) - O(log n)
    dequeue(): T | undefined {
        if (this.isEmpty()) return undefined;

        const min = this.heap[0];
        const last = this.heap.pop()!;

        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.heapifyDown(0);
        }

        return min;
    }

    // Peek at minimum without removing - O(1)
    peek(): T | undefined {
        return this.heap[0];
    }

    // Check if empty - O(1)
    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    // Get size - O(1)
    size(): number {
        return this.heap.length;
    }

    // Get all items (for display) - O(n)
    toArray(): T[] {
        return [...this.heap].sort((a, b) => a.priority - b.priority);
    }
}

// ============================
// 2. TRIE (PREFIX TREE)
// ============================
// Used for: Drug name autocomplete

interface TrieNode {
    children: Map<string, TrieNode>;
    isEndOfWord: boolean;
    data?: any; // Store drug details at leaf nodes
}

export class Trie {
    private root: TrieNode;

    constructor() {
        this.root = this.createNode();
    }

    private createNode(): TrieNode {
        return {
            children: new Map(),
            isEndOfWord: false
        };
    }

    // Insert a word - O(m) where m is word length
    insert(word: string, data?: any): void {
        let current = this.root;
        const lowerWord = word.toLowerCase();

        for (const char of lowerWord) {
            if (!current.children.has(char)) {
                current.children.set(char, this.createNode());
            }
            current = current.children.get(char)!;
        }

        current.isEndOfWord = true;
        current.data = data;
    }

    // Search for exact word - O(m)
    search(word: string): { found: boolean; data?: any } {
        let current = this.root;
        const lowerWord = word.toLowerCase();

        for (const char of lowerWord) {
            if (!current.children.has(char)) {
                return { found: false };
            }
            current = current.children.get(char)!;
        }

        return { found: current.isEndOfWord, data: current.data };
    }

    // Check if prefix exists - O(m)
    startsWith(prefix: string): boolean {
        let current = this.root;
        const lowerPrefix = prefix.toLowerCase();

        for (const char of lowerPrefix) {
            if (!current.children.has(char)) {
                return false;
            }
            current = current.children.get(char)!;
        }

        return true;
    }

    // Get all words with given prefix (autocomplete) - O(n)
    autocomplete(prefix: string, limit: number = 10): { word: string; data?: any }[] {
        const results: { word: string; data?: any }[] = [];
        let current = this.root;
        const lowerPrefix = prefix.toLowerCase();

        // Navigate to prefix node
        for (const char of lowerPrefix) {
            if (!current.children.has(char)) {
                return results;
            }
            current = current.children.get(char)!;
        }

        // DFS to find all words
        this.dfsCollect(current, lowerPrefix, results, limit);
        return results;
    }

    private dfsCollect(
        node: TrieNode,
        prefix: string,
        results: { word: string; data?: any }[],
        limit: number
    ): void {
        if (results.length >= limit) return;

        if (node.isEndOfWord) {
            results.push({ word: prefix, data: node.data });
        }

        for (const [char, childNode] of node.children) {
            this.dfsCollect(childNode, prefix + char, results, limit);
        }
    }
}

// ============================
// 3. LRU CACHE
// ============================
// Used for: Caching frequently accessed drug information

interface CacheNode<K, V> {
    key: K;
    value: V;
    prev: CacheNode<K, V> | null;
    next: CacheNode<K, V> | null;
}

export class LRUCache<K, V> {
    private capacity: number;
    private cache: Map<K, CacheNode<K, V>>;
    private head: CacheNode<K, V> | null = null;
    private tail: CacheNode<K, V> | null = null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    // Get value - O(1)
    get(key: K): V | undefined {
        const node = this.cache.get(key);
        if (!node) return undefined;

        // Move to front (most recently used)
        this.moveToFront(node);
        return node.value;
    }

    // Put value - O(1)
    put(key: K, value: V): void {
        const existingNode = this.cache.get(key);

        if (existingNode) {
            existingNode.value = value;
            this.moveToFront(existingNode);
            return;
        }

        // Create new node
        const newNode: CacheNode<K, V> = {
            key,
            value,
            prev: null,
            next: null
        };

        // Add to cache
        this.cache.set(key, newNode);
        this.addToFront(newNode);

        // Evict if over capacity
        if (this.cache.size > this.capacity) {
            this.removeLRU();
        }
    }

    private moveToFront(node: CacheNode<K, V>): void {
        if (node === this.head) return;

        // Remove from current position
        this.removeNode(node);
        // Add to front
        this.addToFront(node);
    }

    private addToFront(node: CacheNode<K, V>): void {
        node.next = this.head;
        node.prev = null;

        if (this.head) {
            this.head.prev = node;
        }

        this.head = node;

        if (!this.tail) {
            this.tail = node;
        }
    }

    private removeNode(node: CacheNode<K, V>): void {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }
    }

    private removeLRU(): void {
        if (!this.tail) return;

        this.cache.delete(this.tail.key);
        this.removeNode(this.tail);
    }

    // Get current size
    size(): number {
        return this.cache.size;
    }

    // Check if key exists
    has(key: K): boolean {
        return this.cache.has(key);
    }
}

// ============================
// 4. GRAPH (ADJACENCY LIST)
// ============================
// Used for: Doctor recommendation based on symptoms

export class Graph<T> {
    private adjacencyList: Map<T, { node: T; weight: number }[]>;

    constructor() {
        this.adjacencyList = new Map();
    }

    // Add vertex - O(1)
    addVertex(vertex: T): void {
        if (!this.adjacencyList.has(vertex)) {
            this.adjacencyList.set(vertex, []);
        }
    }

    // Add edge - O(1)
    addEdge(from: T, to: T, weight: number = 1): void {
        this.addVertex(from);
        this.addVertex(to);
        this.adjacencyList.get(from)!.push({ node: to, weight });
    }

    // Add bidirectional edge
    addBidirectionalEdge(v1: T, v2: T, weight: number = 1): void {
        this.addEdge(v1, v2, weight);
        this.addEdge(v2, v1, weight);
    }

    // BFS - Find all connected nodes - O(V + E)
    bfs(start: T): T[] {
        const visited = new Set<T>();
        const result: T[] = [];
        const queue: T[] = [start];

        visited.add(start);

        while (queue.length > 0) {
            const current = queue.shift()!;
            result.push(current);

            const neighbors = this.adjacencyList.get(current) || [];
            for (const { node } of neighbors) {
                if (!visited.has(node)) {
                    visited.add(node);
                    queue.push(node);
                }
            }
        }

        return result;
    }

    // DFS - Find path - O(V + E)
    dfs(start: T, target: T): T[] | null {
        const visited = new Set<T>();
        const path: T[] = [];

        const dfsHelper = (current: T): boolean => {
            visited.add(current);
            path.push(current);

            if (current === target) return true;

            const neighbors = this.adjacencyList.get(current) || [];
            for (const { node } of neighbors) {
                if (!visited.has(node) && dfsHelper(node)) {
                    return true;
                }
            }

            path.pop();
            return false;
        };

        return dfsHelper(start) ? path : null;
    }

    // Dijkstra's Algorithm - Shortest path - O((V + E) log V)
    dijkstra(start: T): Map<T, { distance: number; path: T[] }> {
        const distances = new Map<T, number>();
        const previous = new Map<T, T | null>();
        const pq = new PriorityQueue<{ node: T; priority: number }>();

        // Initialize
        for (const vertex of this.adjacencyList.keys()) {
            distances.set(vertex, vertex === start ? 0 : Infinity);
            previous.set(vertex, null);
        }

        pq.enqueue({ node: start, priority: 0 });

        while (!pq.isEmpty()) {
            const { node: current } = pq.dequeue()!;
            const currentDist = distances.get(current)!;

            const neighbors = this.adjacencyList.get(current) || [];
            for (const { node: neighbor, weight } of neighbors) {
                const newDist = currentDist + weight;

                if (newDist < distances.get(neighbor)!) {
                    distances.set(neighbor, newDist);
                    previous.set(neighbor, current);
                    pq.enqueue({ node: neighbor, priority: newDist });
                }
            }
        }

        // Build result with paths
        const result = new Map<T, { distance: number; path: T[] }>();
        for (const [vertex, distance] of distances) {
            const path: T[] = [];
            let current: T | null = vertex;

            while (current !== null) {
                path.unshift(current);
                current = previous.get(current) || null;
            }

            result.set(vertex, { distance, path });
        }

        return result;
    }

    // Get neighbors
    getNeighbors(vertex: T): { node: T; weight: number }[] {
        return this.adjacencyList.get(vertex) || [];
    }
}

// ============================
// 5. SLIDING WINDOW
// ============================
// Used for: Calculating moving averages

export class SlidingWindow {
    private window: number[] = [];
    private windowSize: number;
    private sum: number = 0;

    constructor(windowSize: number) {
        this.windowSize = windowSize;
    }

    // Add value and get current average - O(1)
    add(value: number): number {
        this.window.push(value);
        this.sum += value;

        if (this.window.length > this.windowSize) {
            this.sum -= this.window.shift()!;
        }

        return this.getAverage();
    }

    // Get current average - O(1)
    getAverage(): number {
        if (this.window.length === 0) return 0;
        return this.sum / this.window.length;
    }

    // Get current window - O(1)
    getWindow(): number[] {
        return [...this.window];
    }

    // Get size - O(1)
    size(): number {
        return this.window.length;
    }
}

// ============================
// USAGE EXAMPLE EXPORTS
// ============================

// Create patient queue with priority
export const createPatientQueue = () => new PriorityQueue<QueueItem>();

// Calculate patient priority
export const calculatePriority = (
    isEmergency: boolean,
    age: number,
    severity: number, // 1-10
    waitTimeMinutes: number
): number => {
    let priority = 1000; // Base priority (lower = higher priority)

    if (isEmergency) priority -= 500; // Emergency gets highest priority
    if (age > 60) priority -= 100; // Elderly priority
    if (age > 80) priority -= 50; // Very elderly gets more priority
    priority -= severity * 20; // Higher severity = higher priority
    priority += waitTimeMinutes * 0.5; // Longer wait = slightly lower priority (already waiting)

    return priority;
};

// Create drug search trie
export const createDrugTrie = () => new Trie();

// Create drug cache
export const createDrugCache = (capacity: number = 100) => new LRUCache<string, any>(capacity);

// Create symptom-to-doctor graph
export const createDoctorGraph = () => new Graph<string>();
