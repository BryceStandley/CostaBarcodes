Private Sub Workbook_Open()
    Dim sourceFolder As String
    Dim sourceFileA As String
    Dim sourceFileB As String
    Dim wsSource As Worksheet
    Dim wsDest As Worksheet
    
    Application.ScreenUpdating = False
    
    
    sourceFolder = "C:\Users\nukee\OneDrive\Desktop\excel test\"
    'Set the path and file name of the source file
    sourceFileA = "fv.xlsx"
    'Set the path and file name of the source file
    sourceFileB = "confec.xlsx"
    
    Set wsDest = ThisWorkbook.Worksheets("Sheet1")
    
    'Open the first file
    Workbooks.Open Filename:=sourceFolder + sourceFileA, ReadOnly:=True
    Set wsSource = Workbooks(sourceFileA).Worksheets("Sheet1")
    'Copy the missing data from the source worksheet to the destination worksheet
    wsSource.Range("B2:B" & wsSource.Cells(Rows.Count, "A").End(xlUp).Row).Copy
    wsDest.Range("B" & 2).PasteSpecial Paste:=xlPasteValues
    
    Workbooks(sourceFileA).Close SaveChanges:=False
    
    'Open the second source file
    Workbooks.Open Filename:=sourceFolder + sourceFileB, ReadOnly:=True
    Set wsSource = Workbooks(sourceFileB).Worksheets("Sheet1")
    'Copy the missing data from the source worksheet to the destination worksheet
    wsSource.Range("C2:C" & wsSource.Cells(Rows.Count, "A").End(xlUp).Row).Copy
    wsDest.Range("C" & 2).PasteSpecial Paste:=xlPasteValues
    
    Workbooks(sourceFileB).Close SaveChanges:=False
    
    'Clean up
    Set wsSource = Nothing
    Set wsDest = Nothing
    
    Application.ScreenUpdating = True
    
End Sub