<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'config/database.php';

if (!isset($_GET['q']) || empty(trim($_GET['q']))) {
    echo json_encode(['error' => 'Término de búsqueda vacío']);
    exit;
}

$searchTerm = trim($_GET['q']);
$database = new Database();
$db = $database->getConnection();

try {
    // Verificar si el término de búsqueda parece un documento (solo números)
    $isDocument = preg_match('/^\d+$/', $searchTerm);
    
    if ($isDocument) {
        // Búsqueda exacta por documento de identidad
        $query = "SELECT * FROM jurados 
                  WHERE DocIdentidad = :documento 
                  LIMIT 10";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':documento', $searchTerm);
        
    } else {
        // Dividir en palabras para búsqueda por nombres/apellidos
        $words = preg_split('/\s+/', $searchTerm);
        $words = array_filter($words); // Eliminar elementos vacíos
        $wordCount = count($words);
        
        if ($wordCount >= 2) {
            // Búsqueda EXACTA: nombre completo (nombre + apellido)
            $nombre = $words[0];
            $apellido = implode(' ', array_slice($words, 1));
            
            $query = "SELECT * FROM jurados 
                      WHERE Nombres = :nombre 
                        AND Apellidos = :apellido
                      LIMIT 10";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':apellido', $apellido);
            
        } elseif ($wordCount == 1) {
            // Búsqueda exacta en nombres O apellidos individualmente
            $query = "SELECT * FROM jurados 
                      WHERE Nombres = :termino 
                         OR Apellidos = :termino
                      LIMIT 10";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':termino', $searchTerm);
        }
    }
    
    // Si no hay condiciones, devolver vacío
    if (!isset($stmt)) {
        echo json_encode(['jurados' => []]);
        exit;
    }
    
    $stmt->execute();
    
    $jurados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($jurados) === 0) {
        echo json_encode(['jurados' => []]);
        exit;
    }
    
    // Para cada jurado, buscar su notario
    foreach ($jurados as &$jurado) {
        if (isset($jurado['CodigoMesa']) && !empty($jurado['CodigoMesa'])) {
            $notarioQuery = "SELECT * FROM notarios 
                             WHERE Cod_Mesa = :codigoMesa 
                             LIMIT 1";
            
            $notarioStmt = $db->prepare($notarioQuery);
            $notarioStmt->bindParam(':codigoMesa', $jurado['CodigoMesa']);
            $notarioStmt->execute();
            
            $notario = $notarioStmt->fetch(PDO::FETCH_ASSOC);
            $jurado['notario'] = $notario ?: null;
        } else {
            $jurado['notario'] = null;
        }
    }
    
    echo json_encode(['jurados' => $jurados]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>