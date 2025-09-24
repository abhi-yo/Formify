import crypto from "crypto";

export interface ProofOfWorkChallenge {
  challenge: string;
  difficulty: number;
  timestamp: number;
}

export interface ProofOfWorkSolution {
  challenge: string;
  nonce: string;
  timestamp: number;
}

export function generateChallenge(difficulty: number = 4): ProofOfWorkChallenge {
  const challenge = crypto.randomBytes(16).toString("hex");
  return {
    challenge,
    difficulty,
    timestamp: Date.now(),
  };
}

export function verifyProofOfWork(
  solution: ProofOfWorkSolution,
  difficulty: number = 4
): boolean {
  const { challenge, nonce, timestamp } = solution;
  
  const timeDiff = Date.now() - timestamp;
  if (timeDiff > 300000) {
    return false;
  }

  const hash = crypto
    .createHash("sha256")
    .update(challenge + nonce)
    .digest("hex");

  const target = "0".repeat(difficulty);
  return hash.startsWith(target);
}

export function getDifficultyForProject(submissionCount: number): number {
  if (submissionCount < 100) return 3;
  if (submissionCount < 1000) return 4;
  if (submissionCount < 10000) return 5;
  return 6;
}

export function generateClientScript(challenge: ProofOfWorkChallenge): string {
  return `
    function solveProofOfWork(challenge, difficulty) {
      let nonce = 0;
      const target = "0".repeat(difficulty);
      
      while (true) {
        const hash = CryptoJS.SHA256(challenge + nonce).toString();
        if (hash.startsWith(target)) {
          return {
            challenge: challenge,
            nonce: nonce.toString(),
            timestamp: ${challenge.timestamp}
          };
        }
        nonce++;
        
        if (nonce % 10000 === 0) {
          setTimeout(() => {}, 0);
        }
      }
    }
  `;
}
