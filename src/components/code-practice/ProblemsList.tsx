import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Star, ChevronRight, CheckCircle, Code, Clock } from 'lucide-react';
import { Problem } from './types';

interface ProblemsListProps {
  onSelectProblem: (problem: Problem) => void;
  onClose: () => void;
}

const SAMPLE_PROBLEMS: Problem[] = [
  {
    id: '1', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', category: 'Data Structures', language: 'typescript', xp: 50,
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    inputFormat: 'nums = [2,7,11,15], target = 9', outputFormat: '[0,1]',
    examples: [{ input: 'nums = [2,7,11,15]\ntarget = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }],
    starterCode: 'function twoSum(nums: number[], target: number): number[] {\n  // Write your code here\n  \n}',
    hint: 'Use a hash map to store the elements and their indices.',
    testCases: []
  },
  {
    id: '2', title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked Lists', category: 'Algorithms', language: 'typescript', xp: 60,
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
    inputFormat: 'head = [1,2,3,4,5]', outputFormat: '[5,4,3,2,1]',
    examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }],
    starterCode: '/**\n * Definition for singly-linked list.\n * class ListNode {\n *     val: number\n *     next: ListNode | null\n *     constructor(val?: number, next?: ListNode | null) {\n *         this.val = (val===undefined ? 0 : val)\n *         this.next = (next===undefined ? null : next)\n *     }\n * }\n */\n\nfunction reverseList(head: ListNode | null): ListNode | null {\n    \n};',
    hint: 'Use three pointers: prev, curr, and next.',
    testCases: []
  },
  {
    id: '3', title: 'Longest Substring', difficulty: 'Medium', topic: 'Strings', category: 'Sliding Window', language: 'typescript', xp: 100,
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    constraints: ['0 <= s.length <= 5 * 104', 's consists of English letters, digits, symbols and spaces.'],
    inputFormat: 's = "abcabcbb"', outputFormat: '3',
    examples: [{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' }],
    starterCode: 'function lengthOfLongestSubstring(s: string): number {\n    \n};',
    hint: 'Use a sliding window approach with a hash set.',
    testCases: []
  }
];

export default function ProblemsList({ onSelectProblem, onClose }: ProblemsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');

  const filteredProblems = SAMPLE_PROBLEMS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDiff = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
    return matchSearch && matchDiff;
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-0 z-10 bg-[#f8fafc]/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
          <input 
            type="text" 
            placeholder="Search problems, topics..." 
            className="w-full bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/5 shadow-sm rounded-full py-3.5 pl-14 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar px-1">
          {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${filterDifficulty === diff ? 'bg-indigo-600 text-white scale-105' : 'bg-white dark:bg-[#1a1a1a] text-black/70 dark:text-white/70 border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProblems.map((prob, i) => (
          <motion.div 
            key={prob.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelectProblem(prob)}
            className="group flex flex-col p-5 bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-xl transition-all duration-300 shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-black text-xl tracking-tight">{prob.title}</h3>
                  {prob.id === '1' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                </div>
                <div className="text-black/50 dark:text-white/50 text-sm font-semibold">{prob.category} • {prob.topic}</div>
              </div>
              <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1.5 rounded-full text-sm">
                <Star className="w-4 h-4 fill-current" /> {prob.xp}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className={`px-3 py-1.5 rounded-full ${prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                  {prob.difficulty}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {prob.language}
                </span>
              </div>
              <button className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
        {filteredProblems.length === 0 && (
          <div className="text-center py-20 text-black/50 dark:text-white/50">
            <Code className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold mb-1">No problems found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
