import time
import random


def matmul(A, B):
    """
    Implement matrix multiplication C = A x B using three nested loops.
    A is an n x m matrix, B is an m x p matrix, and C is an n x p matrix.
    """
    n = len(A)
    m = len(A[0])
    p = len(B[0])

    C = [[0 for _ in range(p)] for _ in range(n)]

    for i in range(n):
        for j in range(p):
            total = 0
            for k in range(m):
                total += A[i][k] * B[k][j]
            C[i][j] = total

    return C


def print_matrix(M):
    for row in M:
        print(row)


def verify():
    A = [
        [1, 2],
        [3, 4]
    ]

    B = [
        [5, 6],
        [7, 8]
    ]

    expected = [
        [19, 22],
        [43, 50]
    ]

    result = matmul(A, B)

    print("A =")
    print_matrix(A)

    print("B =")
    print_matrix(B)

    print("Python result C = A x B:")
    print_matrix(result)

    print("Expected result:")
    print_matrix(expected)

    if result == expected:
        print("Verification result: correct")
    else:
        print("Verification result: incorrect")


def performance_test(size):
    A = [[random.randint(0, 9) for _ in range(size)] for _ in range(size)]
    B = [[random.randint(0, 9) for _ in range(size)] for _ in range(size)]

    start = time.time()
    matmul(A, B)
    end = time.time()

    return end - start


if __name__ == "__main__":
    print("===== Correctness Verification =====")
    verify()

    print("\n===== Python Execution Time Test =====")
    for size in [50, 100, 150]:
        t = performance_test(size)
        print(f"{size} x {size} matrix multiplication time: {t:.6f} seconds")
